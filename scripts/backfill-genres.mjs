import { createClient } from "@libsql/client";
import { config } from "dotenv";

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
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const missing = await client.execute(
    "SELECT universeId FROM game WHERE genre IS NULL"
  );
  const universeIds = missing.rows.map((row) => Number(row.universeId));
  console.log("games missing genre:", universeIds.length);

  if (universeIds.length === 0) {
    client.close();
    return;
  }

  const batches = chunkArray(universeIds, GAMES_BATCH_SIZE);
  let updated = 0;

  for (const [index, batch] of batches.entries()) {
    const genreByUniverseId = await fetchGenres(batch);

    const statements = [...genreByUniverseId.entries()].map(
      ([universeId, genre]) => ({
        sql: "UPDATE game SET genre = ? WHERE universeId = ?",
        args: [genre, universeId],
      })
    );

    if (statements.length > 0) {
      await client.batch(statements, "write");
      updated += statements.length;
    }

    console.log(`batch ${index + 1}/${batches.length} done`);
    await sleep(BATCH_PACING_MS);
  }

  console.log(`updated genre for ${updated} games`);
  client.close();
}

await main();
