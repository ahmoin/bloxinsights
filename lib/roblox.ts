import { z } from "zod";

const EXPLORE_API_URL =
  "https://apis.roblox.com/explore-api/v1/get-sort-content";

const exploreGameSchema = z.object({
  universeId: z.number(),
  rootPlaceId: z.number(),
  name: z.string(),
  playerCount: z.number(),
  totalUpVotes: z.number(),
  totalDownVotes: z.number(),
});

const exploreSortContentSchema = z.object({
  games: z.array(exploreGameSchema),
});

export type ExploreGame = z.infer<typeof exploreGameSchema>;

export async function fetchTopPlayingGames(): Promise<ExploreGame[]> {
  const params = new URLSearchParams({
    sessionId: crypto.randomUUID(),
    sortId: "top-playing-now",
  });

  const response = await fetch(`${EXPLORE_API_URL}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Explore API request failed with status ${response.status}`
    );
  }

  const data = exploreSortContentSchema.parse(await response.json());
  return data.games;
}
