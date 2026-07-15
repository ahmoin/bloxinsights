import { tool } from "ai";
import { z } from "zod";
import { getTopGamesByPlayers } from "@/lib/ccu";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export const getTopGames = tool({
  description:
    "Get the biggest Roblox games ranked by current concurrent players (CCU). Use this when the user asks about the biggest, most popular, or highest-player-count games.",
  inputSchema: z.object({
    limit: z
      .number()
      .int()
      .min(1)
      .max(MAX_LIMIT)
      .default(DEFAULT_LIMIT)
      .describe("How many games to return"),
  }),
  execute: async ({ limit }) => {
    const games = await getTopGamesByPlayers(limit);
    return {
      games: games.map((entry) => ({
        creatorName: entry.creatorName,
        name: entry.name,
        playerCount: entry.playerCount,
        rank: entry.rank,
        rankChange: entry.rankChange,
        visits: entry.visits,
      })),
    };
  },
});
