import { createClient } from "@libsql/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const EXPLORE_SORTS_URL = "https://apis.roblox.com/explore-api/v1/get-sorts";
const OMNI_SEARCH_URL = "https://apis.roblox.com/search-api/omni-search";
const GAMES_API_URL = "https://games.roblox.com/v1/games";
const GAMES_BATCH_SIZE = 50;
const DISCOVERY_CONCURRENCY = 5;
const BATCH_PACING_MS = 2000;
const RATE_LIMIT_WAIT_MS = 65_000;
const MAX_ATTEMPTS = 3;
const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const UPSERT_CHUNK_SIZE = 100;
const SNAPSHOT_CHUNK_SIZE = 300;
const KEYWORDS_PER_RUN = 2;
const SEARCH_PAGES_PER_KEYWORD = 2;

const DISCOVERY_VARIANTS = [
  {},
  { device: "console" },
  { device: "vr" },
  ...[
    "gb",
    "de",
    "br",
    "jp",
    "fr",
    "kr",
    "mx",
    "id",
    "ph",
    "tr",
    "pl",
    "th",
    "vn",
    "sa",
    "in",
    "ru",
  ].map((country) => ({ country })),
];

const SEARCH_KEYWORDS = [
  "simulator",
  "tycoon",
  "obby",
  "roleplay",
  "rp",
  "anime",
  "brainrot",
  "horror",
  "battlegrounds",
  "clicker",
  "piece",
  "fruit",
  "tower defense",
  "racing",
  "survival",
  "story",
  "prison",
  "school",
  "pet",
  "dragon",
  "sword",
  "magic",
  "zombie",
  "parkour",
  "murder",
  "hide and seek",
  "soccer",
  "basketball",
  "fps",
  "war",
  "rng",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function chunkArray(items, size) {
  const chunks = [];
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }
  return chunks;
}

function roundToNearestHalfHour(date) {
  return new Date(
    Math.round(date.getTime() / THIRTY_MINUTES_MS) * THIRTY_MINUTES_MS
  );
}

function isValidGame(entry) {
  return (
    typeof entry.universeId === "number" &&
    typeof entry.rootPlaceId === "number" &&
    typeof entry.name === "string" &&
    typeof entry.playerCount === "number"
  );
}

async function fetchSortsVariant(variant) {
  const params = new URLSearchParams({
    sessionId: crypto.randomUUID(),
    ...variant,
  });
  const response = await fetch(`${EXPLORE_SORTS_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Explore sorts request failed: ${response.status}`);
  }
  const data = await response.json();
  return (data.sorts ?? []).flatMap((sort) => sort.games ?? []);
}

async function fetchSearchPage(keyword, pageToken) {
  const params = new URLSearchParams({
    verticalType: "game",
    searchQuery: keyword,
    sessionId: crypto.randomUUID(),
  });
  if (pageToken) {
    params.set("pageToken", pageToken);
  }
  const response = await fetch(`${OMNI_SEARCH_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Omni search request failed: ${response.status}`);
  }
  const data = await response.json();
  const games = (data.searchResults ?? [])
    .filter((group) => group.contentGroupType === "Game")
    .flatMap((group) => group.contents ?? []);
  return { games, nextPageToken: data.nextPageToken };
}

async function fetchSearchedGames() {
  const bucketIndex = Math.floor(Date.now() / THIRTY_MINUTES_MS);
  const games = [];
  for (let offset = 0; offset < KEYWORDS_PER_RUN; offset++) {
    const keyword =
      SEARCH_KEYWORDS[(bucketIndex + offset) % SEARCH_KEYWORDS.length];
    let pageToken;
    for (let page = 0; page < SEARCH_PAGES_PER_KEYWORD; page++) {
      try {
        const result = await fetchSearchPage(keyword, pageToken);
        games.push(...result.games);
        pageToken = result.nextPageToken;
      } catch {
        break;
      }
      if (!pageToken) {
        break;
      }
    }
    console.log(`searched "${keyword}"`);
  }
  return games;
}

async function fetchDiscoveredGames() {
  const games = [];
  for (const group of chunkArray(DISCOVERY_VARIANTS, DISCOVERY_CONCURRENCY)) {
    const results = await Promise.allSettled(group.map(fetchSortsVariant));
    for (const result of results) {
      if (result.status === "fulfilled") {
        games.push(...result.value);
      }
    }
  }
  games.push(...(await fetchSearchedGames()));

  const byUniverseId = new Map();
  for (const entry of games) {
    if (isValidGame(entry)) {
      byUniverseId.set(entry.universeId, entry);
    }
  }
  return [...byUniverseId.values()];
}

async function fetchCcuBatch(universeIds, attempt = 1) {
  const response = await fetch(
    `${GAMES_API_URL}?universeIds=${universeIds.join(",")}`
  );
  if (response.status === 429 && attempt < MAX_ATTEMPTS) {
    console.log(`rate limited, waiting ${RATE_LIMIT_WAIT_MS / 1000}s...`);
    await sleep(RATE_LIMIT_WAIT_MS);
    return await fetchCcuBatch(universeIds, attempt + 1);
  }
  if (!response.ok) {
    throw new Error(`Games API request failed: ${response.status}`);
  }
  const data = await response.json();
  const ccuByUniverseId = new Map();
  for (const entry of data.data ?? []) {
    ccuByUniverseId.set(entry.id, entry.playing ?? 0);
  }
  return ccuByUniverseId;
}

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const timestamp = roundToNearestHalfHour(new Date());
  const timestampSeconds = Math.floor(timestamp.getTime() / 1000);
  console.log("bucket:", timestamp.toISOString());

  const existing = await client.execute({
    sql: "SELECT id FROM gameCcu WHERE timestamp = ? LIMIT 1",
    args: [timestampSeconds],
  });
  if (existing.rows.length > 0) {
    console.log("bucket already captured, skipping");
    client.close();
    return;
  }

  const discoveredGames = await fetchDiscoveredGames();
  console.log("discovered games:", discoveredGames.length);

  for (const batch of chunkArray(discoveredGames, UPSERT_CHUNK_SIZE)) {
    const values = batch.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    const args = batch.flatMap((g) => [
      g.universeId,
      g.rootPlaceId,
      g.name,
      g.playerCount,
      g.totalUpVotes ?? 0,
      g.totalDownVotes ?? 0,
      timestampSeconds,
      timestampSeconds,
    ]);
    await client.execute({
      sql: `INSERT INTO game ("universeId", "rootPlaceId", "name", "playerCount", "totalUpVotes", "totalDownVotes", "createdAt", "updatedAt") VALUES ${values}
        ON CONFLICT("universeId") DO UPDATE SET
          "rootPlaceId" = excluded."rootPlaceId",
          "name" = excluded."name",
          "playerCount" = excluded."playerCount",
          "totalUpVotes" = excluded."totalUpVotes",
          "totalDownVotes" = excluded."totalDownVotes",
          "updatedAt" = excluded."updatedAt"`,
      args,
    });
  }

  const registry = await client.execute("SELECT universeId FROM game");
  const universeIds = registry.rows.map((row) => Number(row.universeId));
  console.log("registry size:", universeIds.length);

  const ccuByUniverseId = new Map();
  const batches = chunkArray(universeIds, GAMES_BATCH_SIZE);
  let batchNum = 0;
  for (const batch of batches) {
    batchNum++;
    const result = await fetchCcuBatch(batch);
    for (const [universeId, playing] of result) {
      ccuByUniverseId.set(universeId, playing);
    }
    console.log(`ccu batch ${batchNum}/${batches.length} done`);
    await sleep(BATCH_PACING_MS);
  }

  const knownUniverseIds = new Set(universeIds);
  const snapshotRows = [...ccuByUniverseId.entries()].filter(([universeId]) =>
    knownUniverseIds.has(universeId)
  );
  const droppedIds = [...ccuByUniverseId.keys()].filter(
    (universeId) => !knownUniverseIds.has(universeId)
  );
  if (droppedIds.length > 0) {
    console.log("dropped unknown universeIds:", droppedIds.join(", "));
  }
  for (const batch of chunkArray(snapshotRows, SNAPSHOT_CHUNK_SIZE)) {
    const values = batch.map(() => "(?, ?, ?)").join(", ");
    const args = batch.flatMap(([universeId, playing]) => [
      universeId,
      playing,
      timestampSeconds,
    ]);
    await client.execute({
      sql: `INSERT INTO gameCcu ("universeId", "playerCount", "timestamp") VALUES ${values}`,
      args,
    });
  }

  const totalCcu = snapshotRows.reduce((sum, [, playing]) => sum + playing, 0);
  console.log(
    `captured ${snapshotRows.length} games | summed CCU: ${totalCcu.toLocaleString()}`
  );
  client.close();
}

await main();
