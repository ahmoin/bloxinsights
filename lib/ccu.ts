import { desc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type ExploreGame,
  fetchChartedGames,
  fetchGameCreators,
  fetchGameIcons,
  fetchGameMetrics,
  fetchLiveCcu,
  type GameMetrics,
} from "@/lib/roblox";
import { game, gameCcu } from "@/lib/schema";
import { chunkArray } from "@/lib/utils";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const UPSERT_CHUNK_SIZE = 100;
const SNAPSHOT_CHUNK_SIZE = 300;
const TOP_GAMES_LIMIT = 5;
const TRENDING_WINDOW_MS = 24 * 60 * 60 * 1000;
const TRENDING_RANK_CUTOFF = 100;
const METADATA_CHUNK_SIZE = 100;
const METRICS_UPDATE_CHUNK_SIZE = 100;
const DEFAULT_GAMES_PAGE = 1;
const DEFAULT_GAMES_PAGE_SIZE = 50;

export type GamesListSortField =
  | "created"
  | "down_votes"
  | "favorites"
  | "playing"
  | "rank_change_day"
  | "up_votes"
  | "visits";

export type GamesListSort = GamesListSortField | `-${GamesListSortField}`;

interface RankedGameRow {
  dateCreated: Date | null;
  downVotes: number;
  favoritedCount: number;
  playerCount: number;
  rankChange: number | null;
  upVotes: number;
  visits: number;
}

function getSortFieldValue(
  row: RankedGameRow,
  field: GamesListSortField
): number {
  switch (field) {
    case "created":
      return row.dateCreated ? row.dateCreated.getTime() : 0;
    case "down_votes":
      return row.downVotes;
    case "favorites":
      return row.favoritedCount;
    case "playing":
      return row.playerCount;
    case "rank_change_day":
      return row.rankChange ?? 0;
    case "up_votes":
      return row.upVotes;
    case "visits":
      return row.visits;
    default:
      return 0;
  }
}

function sortRankedRows<T extends RankedGameRow>(
  rows: T[],
  sort: GamesListSort
): T[] {
  const descending = sort.startsWith("-");
  const field = (descending ? sort.slice(1) : sort) as GamesListSortField;
  return [...rows].sort((a, b) => {
    const diff = getSortFieldValue(a, field) - getSortFieldValue(b, field);
    return descending ? -diff : diff;
  });
}

export type GamesListFilters = Partial<
  Record<GamesListSortField, { max?: number; min?: number }>
>;

function matchesFilters<T extends RankedGameRow>(
  row: T,
  filters: GamesListFilters
): boolean {
  for (const field of Object.keys(filters) as GamesListSortField[]) {
    const range = filters[field];
    if (!range) {
      continue;
    }
    const value = getSortFieldValue(row, field);
    if (range.min !== undefined && value < range.min) {
      return false;
    }
    if (range.max !== undefined && value > range.max) {
      return false;
    }
  }
  return true;
}

export interface GamesListResult {
  games: TopGame[];
  total: number;
}

async function fetchGameMetadataInChunks(universeIds: number[]) {
  const creatorsByUniverseId = new Map<number, string>();
  const iconsByUniverseId = new Map<number, string>();

  for (const chunk of chunkArray(universeIds, METADATA_CHUNK_SIZE)) {
    const [creators, icons] = await Promise.all([
      fetchGameCreators(chunk),
      fetchGameIcons(chunk),
    ]);
    for (const [universeId, creatorName] of creators) {
      creatorsByUniverseId.set(universeId, creatorName);
    }
    for (const [universeId, iconUrl] of icons) {
      iconsByUniverseId.set(universeId, iconUrl);
    }
  }

  return { creatorsByUniverseId, iconsByUniverseId };
}

export interface CcuPoint {
  ccu: number;
  timestamp: string;
}

export interface TopGame {
  creatorName: string | null;
  dateCreated: Date | null;
  downVotes: number;
  favoritedCount: number;
  iconUrl: string | null;
  name: string;
  playerCount: number;
  rank: number;
  rankChange: number | null;
  rootPlaceId: number;
  universeId: number;
  upVotes: number;
  visits: number;
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
  const registryUniverseIds = registry.map((row) => row.universeId);
  const [ccuByUniverseId, metricsByUniverseId] = await Promise.all([
    fetchLiveCcu(registryUniverseIds),
    fetchGameMetrics(registryUniverseIds),
  ]);

  const snapshotRows = [...ccuByUniverseId.entries()].map(
    ([universeId, playerCount]) => ({
      universeId,
      playerCount,
      timestamp,
    })
  );

  for (const batch of chunkArray(snapshotRows, SNAPSHOT_CHUNK_SIZE)) {
    await db.insert(gameCcu).values(batch).onConflictDoNothing();
  }

  await updateGameMetrics(metricsByUniverseId);

  return { games: snapshotRows.length, timestamp, skipped: false };
}

async function updateGameMetrics(
  metricsByUniverseId: Map<number, GameMetrics>
) {
  const entries = [...metricsByUniverseId.entries()];
  for (const batch of chunkArray(entries, METRICS_UPDATE_CHUNK_SIZE)) {
    await Promise.all(
      batch.map(([universeId, metrics]) =>
        db
          .update(game)
          .set({
            dateCreated: metrics.dateCreated,
            favoritedCount: metrics.favoritedCount,
            visits: metrics.visits,
          })
          .where(eq(game.universeId, universeId))
      )
    );
  }
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
      dateCreated: game.dateCreated,
      downVotes: game.totalDownVotes,
      favoritedCount: game.favoritedCount,
      upVotes: game.totalUpVotes,
      visits: game.visits,
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
      ...row,
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

async function getLatestSnapshotCount(timestamp: Date): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(gameCcu)
    .where(eq(gameCcu.timestamp, timestamp));
  return row?.count ?? 0;
}

export async function getGamesList({
  filters,
  page = DEFAULT_GAMES_PAGE,
  pageSize = DEFAULT_GAMES_PAGE_SIZE,
  rankMax,
  sort,
}: {
  filters?: GamesListFilters;
  page?: number;
  pageSize?: number;
  rankMax?: number;
  sort: GamesListSort;
}): Promise<GamesListResult> {
  const [latest, previous] = await getLatestSnapshotTimestamps(2);
  if (!latest) {
    return { games: [], total: 0 };
  }

  const totalGames = await getLatestSnapshotCount(latest);
  const poolSize = rankMax ? Math.min(rankMax, totalGames) : totalGames;

  const rows = await db
    .select({
      universeId: gameCcu.universeId,
      playerCount: gameCcu.playerCount,
      name: game.name,
      rootPlaceId: game.rootPlaceId,
      dateCreated: game.dateCreated,
      downVotes: game.totalDownVotes,
      favoritedCount: game.favoritedCount,
      upVotes: game.totalUpVotes,
      visits: game.visits,
    })
    .from(gameCcu)
    .innerJoin(game, eq(game.universeId, gameCcu.universeId))
    .where(eq(gameCcu.timestamp, latest))
    .orderBy(desc(gameCcu.playerCount))
    .limit(poolSize);

  const previousRanks = previous
    ? await getRanksAtTimestamp(previous)
    : new Map<number, number>();

  const ranked = sortRankedRows(
    rows.map((row, index) => {
      const rank = index + 1;
      const previousRank = previousRanks.get(row.universeId);
      return {
        ...row,
        rank,
        rankChange: previousRank === undefined ? null : previousRank - rank,
      };
    }),
    sort
  );

  const filtered = filters
    ? ranked.filter((row) => matchesFilters(row, filters))
    : ranked;

  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const universeIds = pageRows.map((row) => row.universeId);
  const { creatorsByUniverseId, iconsByUniverseId } =
    await fetchGameMetadataInChunks(universeIds);

  const games = pageRows.map((row) => ({
    ...row,
    creatorName: creatorsByUniverseId.get(row.universeId) ?? null,
    iconUrl: iconsByUniverseId.get(row.universeId) ?? null,
  }));

  return { games, total: filtered.length };
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
