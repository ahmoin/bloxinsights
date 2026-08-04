import { GamesTable } from "@/components/sections/tables/games-table";
import type { GamesListSort, GamesListSortField, TopGame } from "@/lib/ccu";
import { DEFAULT_GAMES_METRIC_COLUMNS } from "@/lib/games-columns";

export function SearchResultsTable({
  currentSort,
  games,
  query,
}: {
  currentSort: GamesListSort;
  games: TopGame[];
  query: string;
}) {
  const visibleColumns = new Set(DEFAULT_GAMES_METRIC_COLUMNS);

  const hrefForSort = (field: GamesListSortField) => {
    const desc = `-${field}` as GamesListSort;
    const nextSort = currentSort === desc ? field : desc;
    const params = new URLSearchParams({ sort: nextSort });
    if (query) {
      params.set("q", query);
    }
    return `/search?${params.toString()}`;
  };

  return (
    <GamesTable
      currentSort={currentSort}
      games={games}
      hrefForSort={hrefForSort}
      visibleColumns={visibleColumns}
    />
  );
}
