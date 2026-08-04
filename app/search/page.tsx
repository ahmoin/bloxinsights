import { AppShell } from "@/components/app-shell";
import { GameSearchBar } from "@/components/sections/search/game-search-bar";
import { SearchResultsTable } from "@/components/sections/search/search-results-table";
import {
  type GamesListSort,
  type GamesListSortField,
  getGamesList,
} from "@/lib/ccu";

const DEFAULT_SORT: GamesListSort = "-playing";
const SEARCH_RESULTS_LIMIT = 50;

const SORT_FIELDS = new Set<GamesListSortField>([
  "created",
  "down_votes",
  "favorites",
  "playing",
  "rank_change_day",
  "up_votes",
  "visits",
]);

function isGamesListSort(value: string | undefined): value is GamesListSort {
  if (!value) {
    return false;
  }
  const field = value.startsWith("-") ? value.slice(1) : value;
  return SORT_FIELDS.has(field as GamesListSortField);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const sort = isGamesListSort(params.sort) ? params.sort : DEFAULT_SORT;

  const { games, total } = query
    ? await getGamesList({ pageSize: SEARCH_RESULTS_LIMIT, query, sort })
    : { games: [], total: 0 };

  return (
    <AppShell title="Search">
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-6">
        <div className="px-4 lg:px-6">
          <GameSearchBar query={query} />
        </div>
        <div className="px-4 lg:px-6">
          <p className="text-muted-foreground text-sm">
            {query
              ? `${total.toLocaleString()} result${total === 1 ? "" : "s"} for "${query}"`
              : "Search for a game by name to get started."}
          </p>
        </div>
        {query && (
          <div className="overflow-hidden rounded-lg border px-4 lg:px-6">
            <SearchResultsTable
              currentSort={sort}
              games={games}
              query={query}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
