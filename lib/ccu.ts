import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { type ExploreGame, fetchTopPlayingGames } from "@/lib/roblox";
import { game, gameCcu } from "@/lib/schema";

function dedupeByUniverseId(games: ExploreGame[]): ExploreGame[] {
  const byUniverseId = new Map<number, ExploreGame>();
  for (const entry of games) {
    byUniverseId.set(entry.universeId, entry);
  }
  return [...byUniverseId.values()];
}

export async function captureCcuSnapshot(timestamp: Date = new Date()) {
  const games = dedupeByUniverseId(await fetchTopPlayingGames());

  if (games.length === 0) {
    return { games: 0, timestamp };
  }

  await db
    .insert(game)
    .values(
      games.map((entry) => ({
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

  await db.insert(gameCcu).values(
    games.map((entry) => ({
      universeId: entry.universeId,
      playerCount: entry.playerCount,
      timestamp,
    }))
  );

  return { games: games.length, timestamp };
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
