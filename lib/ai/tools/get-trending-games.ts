import { tool } from "ai";
import { z } from "zod";
import { getTopMovingGames } from "@/lib/ccu";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export const getTrendingGames = tool({
  description:
    "Get the Roblox games with the biggest rank momentum in the last 24 hours (games moving up fastest in the top 100). Use this when the user asks what's trending, rising, or moving up.",
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
    const movers = await getTopMovingGames(limit);
    return {
      movers: movers.map((entry) => ({
        creatorName: entry.creatorName,
        name: entry.name,
        rank: entry.rank,
        rankShift: entry.rankShift,
      })),
    };
  },
});
