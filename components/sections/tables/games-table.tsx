import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GamesListSort, GamesListSortField, TopGame } from "@/lib/ccu";
import { ColumnFilter } from "./column-filter";

const GAME_ICON_SIZE = 40;

export type GamesListFilters = Partial<
  Record<GamesListSortField, { max?: number; min?: number }>
>;

function sortDirections(field: GamesListSortField) {
  return { asc: field, desc: `-${field}` as GamesListSort };
}

function SortableHead({
  children,
  currentSort,
  filters,
  hrefForSort,
  onFilterChange,
  sortKey,
}: {
  children: ReactNode;
  currentSort?: GamesListSort;
  filters?: GamesListFilters;
  hrefForSort?: (field: GamesListSortField) => string;
  onFilterChange?: (
    field: GamesListSortField,
    min?: number,
    max?: number
  ) => void;
  sortKey: GamesListSortField;
}) {
  const filter = onFilterChange && (
    <ColumnFilter
      max={filters?.[sortKey]?.max}
      min={filters?.[sortKey]?.min}
      onApply={(min, max) => onFilterChange(sortKey, min, max)}
      onClear={() => onFilterChange(sortKey, undefined, undefined)}
    />
  );

  if (!hrefForSort) {
    return (
      <TableHead className="text-right">
        <div className="flex items-center justify-end gap-1">
          {children}
          {filter}
        </div>
      </TableHead>
    );
  }

  const directions = sortDirections(sortKey);
  const isAsc = currentSort === directions.asc;
  const isDesc = currentSort === directions.desc;
  return (
    <TableHead className="text-right">
      <div className="flex items-center justify-end gap-1">
        <Link
          className="inline-flex items-center justify-end gap-1"
          href={hrefForSort(sortKey)}
        >
          {children}
          {isAsc && <ArrowUpIcon className="size-3.5" />}
          {isDesc && <ArrowDownIcon className="size-3.5" />}
          {!(isAsc || isDesc) && (
            <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
          )}
        </Link>
        {filter}
      </div>
    </TableHead>
  );
}

function RankChangeCell({ rankChange }: { rankChange: number | null }) {
  if (rankChange === null || rankChange === 0) {
    return <span className="text-muted-foreground">–</span>;
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

export function GamesTable({
  currentSort,
  filters,
  games,
  hrefForSort,
  onFilterChange,
  visibleColumns,
}: {
  currentSort?: GamesListSort;
  filters?: GamesListFilters;
  games: TopGame[];
  hrefForSort?: (field: GamesListSortField) => string;
  onFilterChange?: (
    field: GamesListSortField,
    min?: number,
    max?: number
  ) => void;
  visibleColumns: Set<string>;
}) {
  const columnCount = 3 + visibleColumns.size;

  return (
    <Table>
      <TableHeader className="bg-muted">
        <TableRow>
          <TableHead className="w-12">Rank</TableHead>
          <TableHead>Game</TableHead>
          <SortableHead
            currentSort={currentSort}
            filters={filters}
            hrefForSort={hrefForSort}
            onFilterChange={onFilterChange}
            sortKey="playing"
          >
            Players (CCU)
          </SortableHead>
          {visibleColumns.has("rankChange") && (
            <SortableHead
              currentSort={currentSort}
              filters={filters}
              hrefForSort={hrefForSort}
              onFilterChange={onFilterChange}
              sortKey="rank_change_day"
            >
              Rank Change
            </SortableHead>
          )}
          {visibleColumns.has("visits") && (
            <SortableHead
              currentSort={currentSort}
              filters={filters}
              hrefForSort={hrefForSort}
              onFilterChange={onFilterChange}
              sortKey="visits"
            >
              Visits
            </SortableHead>
          )}
          {visibleColumns.has("favorites") && (
            <SortableHead
              currentSort={currentSort}
              filters={filters}
              hrefForSort={hrefForSort}
              onFilterChange={onFilterChange}
              sortKey="favorites"
            >
              Favorites
            </SortableHead>
          )}
          {visibleColumns.has("upVotes") && (
            <SortableHead
              currentSort={currentSort}
              filters={filters}
              hrefForSort={hrefForSort}
              onFilterChange={onFilterChange}
              sortKey="up_votes"
            >
              Upvotes
            </SortableHead>
          )}
          {visibleColumns.has("downVotes") && (
            <SortableHead
              currentSort={currentSort}
              filters={filters}
              hrefForSort={hrefForSort}
              onFilterChange={onFilterChange}
              sortKey="down_votes"
            >
              Downvotes
            </SortableHead>
          )}
          {visibleColumns.has("genre") && (
            <TableHead className="text-right">Genre</TableHead>
          )}
          {visibleColumns.has("created") && (
            <SortableHead
              currentSort={currentSort}
              hrefForSort={hrefForSort}
              sortKey="created"
            >
              Created
            </SortableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {games.length === 0 ? (
          <TableRow>
            <TableCell className="h-24 text-center" colSpan={columnCount}>
              No games found.
            </TableCell>
          </TableRow>
        ) : (
          games.map((entry) => (
            <TableRow key={entry.universeId}>
              <TableCell className="font-medium text-muted-foreground">
                #{entry.rank}
              </TableCell>
              <TableCell>
                <Link
                  className="flex items-center gap-2"
                  href={`https://www.roblox.com/games/${entry.rootPlaceId}`}
                  rel="noopener"
                  target="_blank"
                >
                  {entry.iconUrl ? (
                    <Image
                      alt={`${entry.name} icon`}
                      className="rounded"
                      height={GAME_ICON_SIZE}
                      src={entry.iconUrl}
                      width={GAME_ICON_SIZE}
                    />
                  ) : (
                    <div className="size-8 rounded bg-muted" />
                  )}
                  <div className="min-w-0">
                    <div className="line-clamp-1 break-all font-medium">
                      {entry.name}
                    </div>
                    <div className="truncate text-muted-foreground text-xs">
                      {entry.creatorName ? `@${entry.creatorName}` : " "}
                    </div>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {entry.playerCount.toLocaleString()}
              </TableCell>
              {visibleColumns.has("rankChange") && (
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <RankChangeCell rankChange={entry.rankChange} />
                  </div>
                </TableCell>
              )}
              {visibleColumns.has("visits") && (
                <TableCell className="text-right tabular-nums">
                  {entry.visits.toLocaleString()}
                </TableCell>
              )}
              {visibleColumns.has("favorites") && (
                <TableCell className="text-right tabular-nums">
                  {entry.favoritedCount.toLocaleString()}
                </TableCell>
              )}
              {visibleColumns.has("upVotes") && (
                <TableCell className="text-right tabular-nums">
                  {entry.upVotes.toLocaleString()}
                </TableCell>
              )}
              {visibleColumns.has("downVotes") && (
                <TableCell className="text-right tabular-nums">
                  {entry.downVotes.toLocaleString()}
                </TableCell>
              )}
              {visibleColumns.has("genre") && (
                <TableCell className="text-right text-muted-foreground">
                  {entry.genre ?? "–"}
                </TableCell>
              )}
              {visibleColumns.has("created") && (
                <TableCell className="text-right text-muted-foreground">
                  {entry.dateCreated
                    ? entry.dateCreated.toLocaleDateString()
                    : "–"}
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
