import { desc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type ExploreGame,
  fetchChartedGames,
  fetchGameCreators,
  fetchGameIcons,
  fetchLiveCcu,
} from "@/lib/roblox";
import { game, gameCcu } from "@/lib/schema";
import { chunkArray } from "@/lib/utils";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const UPSERT_CHUNK_SIZE = 100;
const SNAPSHOT_CHUNK_SIZE = 300;
const TOP_GAMES_LIMIT = 5;
const TRENDING_WINDOW_MS = 24 * 60 * 60 * 1000;
const TRENDING_RANK_CUTOFF = 100;

export interface CcuPoint {
  ccu: number;
  timestamp: string;
}

export interface TopGame {
  creatorName: string | null;
  iconUrl: string | null;
  name: string;
  playerCount: number;
  rank: number;
  rankChange: number | null;
  rootPlaceId: number;
  universeId: number;
}

export interface TopMover {
  creatorName: string | null;
  iconUrl: string | null;
  name: string;
  rank: number;
  rankShift: number;
  rootPlaceId: number;
  universeId: number;
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

async function getLatestSnapshotTimestamps(count: number): Promise<Date[]> {
  const rows = await db
    .select({ timestamp: gameCcu.timestamp })
    .from(gameCcu)
    .groupBy(gameCcu.timestamp)
    .orderBy(desc(gameCcu.timestamp))
    .limit(count);
  return rows.map((row) => row.timestamp);
}

async function getRanksAtTimestamp(
  timestamp: Date
): Promise<Map<number, number>> {
  const rows = await db
    .select({ universeId: gameCcu.universeId })
    .from(gameCcu)
    .where(eq(gameCcu.timestamp, timestamp))
    .orderBy(desc(gameCcu.playerCount));

  const rankByUniverseId = new Map<number, number>();
  for (const [index, row] of rows.entries()) {
    rankByUniverseId.set(row.universeId, index + 1);
  }
  return rankByUniverseId;
}

export async function getTopGamesByPlayers(
  limit: number = TOP_GAMES_LIMIT
): Promise<TopGame[]> {
  const [latest, previous] = await getLatestSnapshotTimestamps(2);
  if (!latest) {
    return [];
  }

  const topRows = await db
    .select({
      universeId: gameCcu.universeId,
      playerCount: gameCcu.playerCount,
      name: game.name,
      rootPlaceId: game.rootPlaceId,
    })
    .from(gameCcu)
    .innerJoin(game, eq(game.universeId, gameCcu.universeId))
    .where(eq(gameCcu.timestamp, latest))
    .orderBy(desc(gameCcu.playerCount))
    .limit(limit);

  const previousRanks = previous
    ? await getRanksAtTimestamp(previous)
    : new Map<number, number>();

  const universeIds = topRows.map((row) => row.universeId);
  const [creators, icons] = await Promise.all([
    fetchGameCreators(universeIds),
    fetchGameIcons(universeIds),
  ]);

  return topRows.map((row, index) => {
    const rank = index + 1;
    const previousRank = previousRanks.get(row.universeId);
    return {
      universeId: row.universeId,
      rootPlaceId: row.rootPlaceId,
      name: row.name,
      playerCount: row.playerCount,
      rank,
      rankChange: previousRank === undefined ? null : previousRank - rank,
      creatorName: creators.get(row.universeId) ?? null,
      iconUrl: icons.get(row.universeId) ?? null,
    };
  });
}

async function getTrendingBaselineTimestamp(
  latest: Date
): Promise<Date | undefined> {
  const target = new Date(latest.getTime() - TRENDING_WINDOW_MS);
  const [atOrBefore] = await db
    .select({ timestamp: gameCcu.timestamp })
    .from(gameCcu)
    .where(lte(gameCcu.timestamp, target))
    .groupBy(gameCcu.timestamp)
    .orderBy(desc(gameCcu.timestamp))
    .limit(1);
  if (atOrBefore) {
    return atOrBefore.timestamp;
  }

  const [earliest] = await db
    .select({ timestamp: gameCcu.timestamp })
    .from(gameCcu)
    .groupBy(gameCcu.timestamp)
    .orderBy(gameCcu.timestamp)
    .limit(1);
  if (earliest && earliest.timestamp.getTime() < latest.getTime()) {
    return earliest.timestamp;
  }
  return;
}

export async function getTopMovingGames(
  limit: number = TOP_GAMES_LIMIT
): Promise<TopMover[]> {
  const [latest] = await getLatestSnapshotTimestamps(1);
  if (!latest) {
    return [];
  }

  const baseline = await getTrendingBaselineTimestamp(latest);
  if (!baseline) {
    return [];
  }

  const latestRows = await db
    .select({
      universeId: gameCcu.universeId,
      name: game.name,
      rootPlaceId: game.rootPlaceId,
    })
    .from(gameCcu)
    .innerJoin(game, eq(game.universeId, gameCcu.universeId))
    .where(eq(gameCcu.timestamp, latest))
    .orderBy(desc(gameCcu.playerCount))
    .limit(TRENDING_RANK_CUTOFF);

  const baselineRanks = await getRanksAtTimestamp(baseline);

  const movers = latestRows
    .map((row, index) => {
      const rank = index + 1;
      const baselineRank = baselineRanks.get(row.universeId);
      return {
        ...row,
        rank,
        rankShift: baselineRank === undefined ? 0 : baselineRank - rank,
      };
    })
    .filter((row) => row.rankShift > 0)
    .sort((a, b) => b.rankShift - a.rankShift)
    .slice(0, limit);

  const universeIds = movers.map((row) => row.universeId);
  const [creators, icons] = await Promise.all([
    fetchGameCreators(universeIds),
    fetchGameIcons(universeIds),
  ]);

  return movers.map((row) => ({
    universeId: row.universeId,
    rootPlaceId: row.rootPlaceId,
    name: row.name,
    rank: row.rank,
    rankShift: row.rankShift,
    creatorName: creators.get(row.universeId) ?? null,
    iconUrl: icons.get(row.universeId) ?? null,
  }));
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
