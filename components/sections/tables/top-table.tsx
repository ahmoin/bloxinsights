"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { GamesTable } from "@/components/sections/tables/games-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GamesListSort, TopGame } from "@/lib/ccu";

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

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return games;
    }
    return games.filter((entry) =>
      entry.name.toLowerCase().includes(normalizedQuery)
    );
  }, [games, query]);

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
        <GamesTable games={filteredGames} visibleColumns={new Set()} />
      </div>
    </div>
  );
}
