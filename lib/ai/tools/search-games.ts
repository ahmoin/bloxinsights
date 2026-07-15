import { tool } from "ai";
import { z } from "zod";
import { type GamesListSort, getGamesList } from "@/lib/ccu";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const SEARCH_POOL_SIZE = 200;

const SORT_OPTIONS = [
  "-playing",
  "-visits",
  "-favorites",
  "-rank_change_day",
  "-created",
  "-up_votes",
  "-down_votes",
] as const satisfies readonly GamesListSort[];

export const searchGames = tool({
  description:
    "Search or list Roblox games tracked on the platform, optionally filtered by name and sorted by players, visits, favorites, rank change, recency (created), upvotes, or downvotes. Use this for questions about a specific game by name, or for browsing games by a metric other than raw CCU rank — including 'recently created' or 'newest' games (sort: -created).",
  inputSchema: z.object({
    limit: z
      .number()
      .int()
      .min(1)
      .max(MAX_LIMIT)
      .default(DEFAULT_LIMIT)
      .describe("How many games to return"),
    query: z
      .string()
      .optional()
      .describe(
        "Filter games whose name contains this text (case-insensitive)"
      ),
    sort: z
      .enum(SORT_OPTIONS)
      .default("-playing")
      .describe("Which metric to sort by, descending"),
  }),
  execute: async ({ limit, query, sort }) => {
    const { games } = await getGamesList({
      pageSize: SEARCH_POOL_SIZE,
      sort,
    });

    const normalizedQuery = query?.trim().toLowerCase();
    const filtered = normalizedQuery
      ? games.filter((entry) =>
          entry.name.toLowerCase().includes(normalizedQuery)
        )
      : games;

    return {
      games: filtered.slice(0, limit).map((entry) => ({
        creatorName: entry.creatorName,
        dateCreated: entry.dateCreated?.toISOString() ?? null,
        favoritedCount: entry.favoritedCount,
        name: entry.name,
        playerCount: entry.playerCount,
        rank: entry.rank,
        rankChange: entry.rankChange,
        visits: entry.visits,
      })),
    };
  },
});
