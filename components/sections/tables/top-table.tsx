"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  type GamesListFilters,
  GamesTable,
} from "@/components/sections/tables/games-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GamesListSort, GamesListSortField, TopGame } from "@/lib/ccu";

function getGamesListSortFieldValue(
  entry: TopGame,
  field: GamesListSortField
): number {
  switch (field) {
    case "created":
      return entry.dateCreated ? entry.dateCreated.getTime() : 0;
    case "down_votes":
      return entry.downVotes;
    case "favorites":
      return entry.favoritedCount;
    case "playing":
      return entry.playerCount;
    case "rank_change_day":
      return entry.rankChange ?? 0;
    case "up_votes":
      return entry.upVotes;
    case "visits":
      return entry.visits;
    default:
      return 0;
  }
}

function matchesGamesListFilters(
  entry: TopGame,
  filters: GamesListFilters
): boolean {
  for (const field of Object.keys(filters) as GamesListSortField[]) {
    const range = filters[field];
    if (!range) {
      continue;
    }
    const value = getGamesListSortFieldValue(entry, field);
    if (range.min !== undefined && value < range.min) {
      return false;
    }
    if (range.max !== undefined && value > range.max) {
      return false;
    }
  }
  return true;
}

const SORT_OPTIONS: { label: string; value: GamesListSort }[] = [
  { label: "By Players (CCU)", value: "-playing" },
  { label: "By Visits", value: "-visits" },
  { label: "By Favorites", value: "-favorites" },
  { label: "By Rank Change", value: "-rank_change_day" },
];

export function TopTable({
  games,
  sort,
}: {
  games: TopGame[];
  sort: GamesListSort;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<GamesListFilters>({});

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return games.filter(
      (entry) =>
        (!normalizedQuery ||
          entry.name.toLowerCase().includes(normalizedQuery)) &&
        matchesGamesListFilters(entry, filters)
    );
  }, [games, query, filters]);

  const handleFilterChange = (
    field: GamesListSortField,
    min?: number,
    max?: number
  ) => {
    setFilters((previous) => {
      const next = { ...previous };
      if (min === undefined && max === undefined) {
        delete next[field];
      } else {
        next[field] = { max, min };
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Select
          onValueChange={(value) => router.push(`/top?sort=${value}`)}
          value={sort}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Filter by game name"
            className="pl-8"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter name"
            type="text"
            value={query}
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <GamesTable
          filters={filters}
          games={filteredGames}
          onFilterChange={handleFilterChange}
          visibleColumns={new Set()}
        />
      </div>
    </div>
  );
}
