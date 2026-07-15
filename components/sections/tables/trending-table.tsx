"use client";

import { SearchIcon, TrendingUpIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ColumnFilter } from "@/components/sections/tables/column-filter";
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
import type { TopMover } from "@/lib/ccu";

const GAME_ICON_SIZE = 40;

export function TrendingTable({ topMovers }: { topMovers: TopMover[] }) {
  const [query, setQuery] = useState("");
  const [rankShiftMin, setRankShiftMin] = useState<number | undefined>(
    undefined
  );
  const [rankShiftMax, setRankShiftMax] = useState<number | undefined>(
    undefined
  );

  const filteredMovers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return topMovers.filter((entry) => {
      if (
        normalizedQuery &&
        !entry.name.toLowerCase().includes(normalizedQuery)
      ) {
        return false;
      }
      if (rankShiftMin !== undefined && entry.rankShift < rankShiftMin) {
        return false;
      }
      if (rankShiftMax !== undefined && entry.rankShift > rankShiftMax) {
        return false;
      }
      return true;
    });
  }, [topMovers, query, rankShiftMin, rankShiftMax]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
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
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Game</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1">
                  Rank Shift
                  <ColumnFilter
                    max={rankShiftMax}
                    min={rankShiftMin}
                    onApply={(min, max) => {
                      setRankShiftMin(min);
                      setRankShiftMax(max);
                    }}
                    onClear={() => {
                      setRankShiftMin(undefined);
                      setRankShiftMax(undefined);
                    }}
                  />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovers.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={3}>
                  No trending games found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMovers.map((entry) => (
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
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Badge
                        className="border-green-500/30 bg-green-500/10 text-green-500"
                        variant="outline"
                      >
                        <TrendingUpIcon />
                        {entry.rankShift.toLocaleString()}
                      </Badge>
                    </div>
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
