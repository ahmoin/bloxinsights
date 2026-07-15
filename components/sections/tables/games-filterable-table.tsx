"use client";

import { useRouter } from "next/navigation";
import {
  type GamesListFilters,
  GamesTable,
} from "@/components/sections/tables/games-table";
import type { GamesListSort, GamesListSortField, TopGame } from "@/lib/ccu";

export function GamesFilterableTable({
  baseQuery,
  currentSort,
  filters,
  games,
  visibleColumns,
}: {
  baseQuery: Record<string, string>;
  currentSort: GamesListSort;
  filters: GamesListFilters;
  games: TopGame[];
  visibleColumns: Set<string>;
}) {
  const router = useRouter();

  const hrefForSort = (field: GamesListSortField) => {
    const desc = `-${field}` as GamesListSort;
    const nextSort = currentSort === desc ? field : desc;
    const query = new URLSearchParams(baseQuery);
    query.set("sort", nextSort);
    query.delete("page");
    return `/games?${query.toString()}`;
  };

  const handleFilterChange = (
    field: GamesListSortField,
    min?: number,
    max?: number
  ) => {
    const query = new URLSearchParams(baseQuery);
    query.delete(`f_${field}_min`);
    query.delete(`f_${field}_max`);
    if (min !== undefined) {
      query.set(`f_${field}_min`, String(min));
    }
    if (max !== undefined) {
      query.set(`f_${field}_max`, String(max));
    }
    query.delete("page");
    router.push(`/games?${query.toString()}`);
  };

  return (
    <GamesTable
      currentSort={currentSort}
      filters={filters}
      games={games}
      hrefForSort={hrefForSort}
      onFilterChange={handleFilterChange}
      visibleColumns={visibleColumns}
    />
  );
}
