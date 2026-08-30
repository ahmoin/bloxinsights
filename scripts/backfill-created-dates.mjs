import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const GAMES_API_URL = "https://games.roblox.com/v1/games";
const GAMES_BATCH_SIZE = 50;
const BATCH_PACING_MS = 2000;
const RATE_LIMIT_WAIT_MS = 65_000;
const MAX_ATTEMPTS = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function chunkArray(items, size) {
  const chunks = [];
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }
  return chunks;
}

async function fetchCreatedDates(universeIds, attempt = 1) {
  const response = await fetch(
    `${GAMES_API_URL}?universeIds=${universeIds.join(",")}`
  );
  if (response.status === 429 && attempt < MAX_ATTEMPTS) {
    console.log(`rate limited, waiting ${RATE_LIMIT_WAIT_MS / 1000}s...`);
    await sleep(RATE_LIMIT_WAIT_MS);
    return await fetchCreatedDates(universeIds, attempt + 1);
  }
  if (!response.ok) {
    throw new Error(`Games API request failed: ${response.status}`);
  }
  const data = await response.json();
  const dateCreatedByUniverseId = new Map();
  for (const entry of data.data ?? []) {
    if (entry.created) {
      dateCreatedByUniverseId.set(entry.id, new Date(entry.created));
    }
  }
  return dateCreatedByUniverseId;
}

async function main() {
  const client = postgres(process.env.DATABASE_URL);

  const missing = await client.unsafe(
    'SELECT "universeId" FROM "game" WHERE "dateCreated" IS NULL'
  );
  const universeIds = missing.map((row) => Number(row.universeId));
  console.log("games missing dateCreated:", universeIds.length);

  if (universeIds.length === 0) {
    await client.end();
    return;
  }

  const batches = chunkArray(universeIds, GAMES_BATCH_SIZE);
  let updated = 0;

  for (const [index, batch] of batches.entries()) {
    const dateCreatedByUniverseId = await fetchCreatedDates(batch);

    for (const [universeId, dateCreated] of dateCreatedByUniverseId) {
      await client.unsafe(
        'UPDATE "game" SET "dateCreated" = $1 WHERE "universeId" = $2',
        [dateCreated, universeId]
      );
      updated++;
    }

    console.log(`batch ${index + 1}/${batches.length} done`);
    await sleep(BATCH_PACING_MS);
  }

  console.log(`updated dateCreated for ${updated} games`);
  await client.end();
}

await main();
