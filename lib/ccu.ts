import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type ExploreGame,
  fetchChartedGames,
  fetchLiveCcu,
} from "@/lib/roblox";
import { game, gameCcu } from "@/lib/schema";
import { chunkArray } from "@/lib/utils";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const UPSERT_CHUNK_SIZE = 100;
const SNAPSHOT_CHUNK_SIZE = 300;

export interface CcuPoint {
  ccu: number;
  timestamp: string;
}

function roundToNearestHalfHour(date: Date): Date {
  return new Date(
    Math.round(date.getTime() / THIRTY_MINUTES_MS) * THIRTY_MINUTES_MS
  );
}

function dedupeByUniverseId(games: ExploreGame[]): ExploreGame[] {
  const byUniverseId = new Map<number, ExploreGame>();
  for (const entry of games) {
    byUniverseId.set(entry.universeId, entry);
  }
  return [...byUniverseId.values()];
}

async function upsertChartedGames(
  chartedGames: ExploreGame[],
  timestamp: Date
) {
  for (const batch of chunkArray(chartedGames, UPSERT_CHUNK_SIZE)) {
    await db
      .insert(game)
      .values(
        batch.map((entry) => ({
          universeId: entry.universeId,
          rootPlaceId: entry.rootPlaceId,
          name: entry.name,
          playerCount: entry.playerCount,
          totalUpVotes: entry.totalUpVotes,
          totalDownVotes: entry.totalDownVotes,
        }))
      )
      .onConflictDoUpdate({
        target: game.universeId,
        set: {
          rootPlaceId: sql`excluded."rootPlaceId"`,
          name: sql`excluded."name"`,
          playerCount: sql`excluded."playerCount"`,
          totalUpVotes: sql`excluded."totalUpVotes"`,
          totalDownVotes: sql`excluded."totalDownVotes"`,
          updatedAt: timestamp,
        },
      });
  }
}

export async function captureCcuSnapshot(now: Date = new Date()) {
  const timestamp = roundToNearestHalfHour(now);

  const existing = await db
    .select({ id: gameCcu.id })
    .from(gameCcu)
    .where(eq(gameCcu.timestamp, timestamp))
    .limit(1);

  if (existing.length > 0) {
    return { games: 0, timestamp, skipped: true };
  }

  const chartedGames = dedupeByUniverseId(await fetchChartedGames());
  if (chartedGames.length > 0) {
    await upsertChartedGames(chartedGames, timestamp);
  }

  const registry = await db.select({ universeId: game.universeId }).from(game);
  const ccuByUniverseId = await fetchLiveCcu(
    registry.map((row) => row.universeId)
  );

  const snapshotRows = [...ccuByUniverseId.entries()].map(
    ([universeId, playerCount]) => ({
      universeId,
      playerCount,
      timestamp,
    })
  );

  for (const batch of chunkArray(snapshotRows, SNAPSHOT_CHUNK_SIZE)) {
    await db.insert(gameCcu).values(batch);
  }

  return { games: snapshotRows.length, timestamp, skipped: false };
}

export async function getPlatformCcuHistory() {
  return await db
    .select({
      timestamp: gameCcu.timestamp,
      ccu: sql<number>`sum(${gameCcu.playerCount})`.mapWith(Number),
    })
    .from(gameCcu)
    .groupBy(gameCcu.timestamp)
    .orderBy(gameCcu.timestamp);
}
