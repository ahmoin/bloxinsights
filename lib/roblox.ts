import { z } from "zod";
import { chunkArray, sleep } from "@/lib/utils";

const EXPLORE_SORTS_URL = "https://apis.roblox.com/explore-api/v1/get-sorts";
const GAMES_API_URL = "https://games.roblox.com/v1/games";
const GAMES_BATCH_SIZE = 50;
const FETCH_CONCURRENCY = 5;

const DISCOVERY_COUNTRIES = [
  "gb",
  "de",
  "br",
  "jp",
  "fr",
  "kr",
  "mx",
  "id",
  "ph",
  "tr",
  "pl",
  "th",
  "vn",
  "sa",
  "in",
  "ru",
];

const DISCOVERY_VARIANTS: Record<string, string>[] = [
  {},
  { device: "console" },
  { device: "vr" },
  ...DISCOVERY_COUNTRIES.map((country) => ({ country })),
];

const exploreGameSchema = z.object({
  universeId: z.number(),
  rootPlaceId: z.number(),
  name: z.string(),
  playerCount: z.number(),
  totalUpVotes: z.number(),
  totalDownVotes: z.number(),
});

const exploreSortSchema = z.object({
  sortId: z.string(),
  games: z.array(exploreGameSchema).nullish(),
});

const exploreSortsResponseSchema = z.object({
  sorts: z.array(exploreSortSchema),
});

const gameDetailsSchema = z.object({
  id: z.number(),
  playing: z.number().default(0),
});

const gamesResponseSchema = z.object({
  data: z.array(gameDetailsSchema),
});

export type ExploreGame = z.infer<typeof exploreGameSchema>;

async function fetchSortsVariant(
  variant: Record<string, string>
): Promise<ExploreGame[]> {
  const params = new URLSearchParams({
    sessionId: crypto.randomUUID(),
    ...variant,
  });

  const response = await fetch(`${EXPLORE_SORTS_URL}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Explore sorts request failed with status ${response.status}`
    );
  }

  const data = exploreSortsResponseSchema.parse(await response.json());
  return data.sorts.flatMap((sort) => sort.games ?? []);
}

export async function fetchChartedGames(): Promise<ExploreGame[]> {
  const games: ExploreGame[] = [];

  for (const group of chunkArray(DISCOVERY_VARIANTS, FETCH_CONCURRENCY)) {
    const results = await Promise.allSettled(group.map(fetchSortsVariant));
    for (const result of results) {
      if (result.status === "fulfilled") {
        games.push(...result.value);
      }
    }
  }

  return games;
}

const HTTP_TOO_MANY_REQUESTS = 429;
const RATE_LIMIT_WAIT_MS = 65_000;
const MAX_ATTEMPTS = 3;
const BATCH_PACING_MS = 2000;

async function fetchCcuBatch(
  universeIds: number[],
  attempt = 1
): Promise<Map<number, number>> {
  const response = await fetch(
    `${GAMES_API_URL}?universeIds=${universeIds.join(",")}`,
    { cache: "no-store" }
  );

  if (response.status === HTTP_TOO_MANY_REQUESTS && attempt < MAX_ATTEMPTS) {
    await sleep(RATE_LIMIT_WAIT_MS);
    return await fetchCcuBatch(universeIds, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`Games API request failed with status ${response.status}`);
  }

  const data = gamesResponseSchema.parse(await response.json());
  const ccuByUniverseId = new Map<number, number>();
  for (const entry of data.data) {
    ccuByUniverseId.set(entry.id, entry.playing);
  }
  return ccuByUniverseId;
}

export async function fetchLiveCcu(
  universeIds: number[]
): Promise<Map<number, number>> {
  const ccuByUniverseId = new Map<number, number>();

  for (const batch of chunkArray(universeIds, GAMES_BATCH_SIZE)) {
    const result = await fetchCcuBatch(batch);
    for (const [universeId, playing] of result) {
      ccuByUniverseId.set(universeId, playing);
    }
    await sleep(BATCH_PACING_MS);
  }

  return ccuByUniverseId;
}
