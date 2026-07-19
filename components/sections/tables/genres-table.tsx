"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  SearchIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GenreSummary } from "@/lib/ccu";
import { ColumnFilter } from "./column-filter";

type SortField = "favorites" | "games" | "playing" | "rating" | "visits";
type Sort = SortField | `-${SortField}`;

type Filters = Partial<Record<SortField, { max?: number; min?: number }>>;

function getSortFieldValue(entry: GenreSummary, field: SortField): number {
  switch (field) {
    case "favorites":
      return entry.totalFavorites;
    case "games":
      return entry.gameCount;
    case "playing":
      return entry.totalPlayers;
    case "rating":
      return entry.avgRating ?? 0;
    case "visits":
      return entry.totalVisits;
    default:
      return 0;
  }
}

function matchesFilters(entry: GenreSummary, filters: Filters): boolean {
  for (const field of Object.keys(filters) as SortField[]) {
    const range = filters[field];
    if (!range) {
      continue;
    }
    const value = getSortFieldValue(entry, field);
    if (range.min !== undefined && value < range.min) {
      return false;
    }
    if (range.max !== undefined && value > range.max) {
      return false;
    }
  }
  return true;
}

function sortEntries(entries: GenreSummary[], sort: Sort): GenreSummary[] {
  const descending = sort.startsWith("-");
  const field = (descending ? sort.slice(1) : sort) as SortField;
  return [...entries].sort((a, b) => {
    const diff = getSortFieldValue(a, field) - getSortFieldValue(b, field);
    return descending ? -diff : diff;
  });
}

function RankChangeCell({ rankChange }: { rankChange: number | null }) {
  if (rankChange === null || rankChange === 0) {
    return <span className="text-muted-foreground">-</span>;
  }
  const movedUp = rankChange > 0;
  return (
    <Badge
      className={
        movedUp
          ? "border-green-500/30 bg-green-500/10 text-green-500"
          : "border-red-500/30 bg-red-500/10 text-red-500"
      }
      variant="outline"
    >
      {movedUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
      {Math.abs(rankChange)}
    </Badge>
  );
}

function SortableHead({
  children,
  currentSort,
  field,
  filters,
  onFilterChange,
  onSortChange,
}: {
  children: ReactNode;
  currentSort: Sort;
  field: SortField;
  filters: Filters;
  onFilterChange: (field: SortField, min?: number, max?: number) => void;
  onSortChange: (sort: Sort) => void;
}) {
  const desc: Sort = `-${field}`;
  const isAsc = currentSort === field;
  const isDesc = currentSort === desc;

  return (
    <TableHead className="text-right">
      <div className="flex items-center justify-end gap-1">
        <button
          className="inline-flex items-center justify-end gap-1"
          onClick={() => onSortChange(isDesc ? field : desc)}
          type="button"
        >
          {children}
          {isAsc && <ArrowUpIcon className="size-3.5" />}
          {isDesc && <ArrowDownIcon className="size-3.5" />}
          {!(isAsc || isDesc) && (
            <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
          )}
        </button>
        <ColumnFilter
          max={filters[field]?.max}
          min={filters[field]?.min}
          onApply={(min, max) => onFilterChange(field, min, max)}
          onClear={() => onFilterChange(field, undefined, undefined)}
        />
      </div>
    </TableHead>
  );
}

export function GenresTable({ genres }: { genres: GenreSummary[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("-playing");
  const [filters, setFilters] = useState<Filters>({});

  const handleFilterChange = (field: SortField, min?: number, max?: number) => {
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

  const visibleGenres = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = genres.filter(
      (entry) =>
        (!normalizedQuery ||
          entry.genre.toLowerCase().includes(normalizedQuery)) &&
        matchesFilters(entry, filters)
    );
    return sortEntries(filtered, sort);
  }, [genres, query, filters, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full sm:w-64">
        <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Filter by genre name"
          className="pl-8"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter genre"
          type="text"
          value={query}
        />
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Genre</TableHead>
              <SortableHead
                currentSort={sort}
                field="playing"
                filters={filters}
                onFilterChange={handleFilterChange}
                onSortChange={setSort}
              >
                Players (CCU)
              </SortableHead>
              <SortableHead
                currentSort={sort}
                field="visits"
                filters={filters}
                onFilterChange={handleFilterChange}
                onSortChange={setSort}
              >
                Visits
              </SortableHead>
              <SortableHead
                currentSort={sort}
                field="favorites"
                filters={filters}
                onFilterChange={handleFilterChange}
                onSortChange={setSort}
              >
                Favorites
              </SortableHead>
              <SortableHead
                currentSort={sort}
                field="games"
                filters={filters}
                onFilterChange={handleFilterChange}
                onSortChange={setSort}
              >
                Games
              </SortableHead>
              <SortableHead
                currentSort={sort}
                field="rating"
                filters={filters}
                onFilterChange={handleFilterChange}
                onSortChange={setSort}
              >
                Avg Rating
              </SortableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleGenres.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={7}>
                  No genres found.
                </TableCell>
              </TableRow>
            ) : (
              visibleGenres.map((entry) => (
                <TableRow key={entry.genre}>
                  <TableCell className="font-medium text-muted-foreground">
                    #{entry.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.genre}</span>
                      <RankChangeCell rankChange={entry.rankChange} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {entry.totalPlayers.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {entry.totalVisits.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {entry.totalFavorites.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {entry.gameCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {entry.avgRating === null
                      ? "-"
                      : `${entry.avgRating.toFixed(2)}%`}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
