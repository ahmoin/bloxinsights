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

async function fetchGenres(universeIds, attempt = 1) {
  const response = await fetch(
    `${GAMES_API_URL}?universeIds=${universeIds.join(",")}`
  );
  if (response.status === 429 && attempt < MAX_ATTEMPTS) {
    console.log(`rate limited, waiting ${RATE_LIMIT_WAIT_MS / 1000}s...`);
    await sleep(RATE_LIMIT_WAIT_MS);
    return await fetchGenres(universeIds, attempt + 1);
  }
  if (!response.ok) {
    throw new Error(`Games API request failed: ${response.status}`);
  }
  const data = await response.json();
  const genreByUniverseId = new Map();
  for (const entry of data.data ?? []) {
    if (entry.genre) {
      genreByUniverseId.set(entry.id, entry.genre);
    }
  }
  return genreByUniverseId;
}

async function main() {
  const client = postgres(process.env.DATABASE_URL);

  const missing = await client.unsafe(
    'SELECT "universeId" FROM "game" WHERE genre IS NULL'
  );
  const universeIds = missing.map((row) => Number(row.universeId));
  console.log("games missing genre:", universeIds.length);

  if (universeIds.length === 0) {
    await client.end();
    return;
  }

  const batches = chunkArray(universeIds, GAMES_BATCH_SIZE);
  let updated = 0;

  for (const [index, batch] of batches.entries()) {
    const genreByUniverseId = await fetchGenres(batch);

    for (const [universeId, genre] of genreByUniverseId) {
      await client.unsafe(
        'UPDATE "game" SET genre = $1 WHERE "universeId" = $2',
        [genre, universeId]
      );
      updated++;
    }

    console.log(`batch ${index + 1}/${batches.length} done`);
    await sleep(BATCH_PACING_MS);
  }

  console.log(`updated genre for ${updated} games`);
  await client.end();
}

await main();
