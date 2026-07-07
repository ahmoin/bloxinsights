"use client";

import {
  FlameIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TrophyIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import type { CcuPoint, TopGame, TopMover } from "@/lib/ccu";

const GAME_ICON_SIZE = 40;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface AverageStats {
  average: number;
  changePercentage: number | null;
}

interface PeakStats {
  changePercentage: number | null;
  peak: number;
  peakAt: Date | null;
  yesterdayPeak: number | null;
}

interface LeaderboardEntry {
  badge: ReactNode;
  creatorName: string | null;
  iconUrl: string | null;
  name: string;
  rank: number;
  rootPlaceId: number;
  universeId: number;
}

function getAverageInWindow(
  entries: CcuPoint[],
  start: Date,
  end: Date
): number | null {
  let total = 0;
  let count = 0;
  for (const entry of entries) {
    const date = new Date(entry.timestamp);
    if (date < start || date > end) {
      continue;
    }
    total += entry.ccu;
    count += 1;
  }
  return count === 0 ? null : Math.round(total / count);
}

function getAverageStatsLast24Hours(entries: CcuPoint[]): AverageStats {
  if (entries.length === 0) {
    return { average: 0, changePercentage: null };
  }

  const now = new Date(
    Math.max(...entries.map((entry) => new Date(entry.timestamp).getTime()))
  );
  const oneDayAgo = new Date(now.getTime() - ONE_DAY_MS);
  const twoDaysAgo = new Date(now.getTime() - 2 * ONE_DAY_MS);

  const average = getAverageInWindow(entries, oneDayAgo, now) ?? 0;
  const previousAverage = getAverageInWindow(entries, twoDaysAgo, oneDayAgo);

  return {
    average,
    changePercentage:
      previousAverage === null || previousAverage === 0
        ? null
        : ((average - previousAverage) / previousAverage) * 100,
  };
}

function getPeakEntryInWindow(
  entries: CcuPoint[],
  start: Date,
  end: Date
): CcuPoint | null {
  let peakEntry: CcuPoint | null = null;
  for (const entry of entries) {
    const date = new Date(entry.timestamp);
    if (date < start || date > end) {
      continue;
    }
    if (peakEntry === null || entry.ccu > peakEntry.ccu) {
      peakEntry = entry;
    }
  }
  return peakEntry;
}

function getPeakStatsLast24Hours(entries: CcuPoint[]): PeakStats {
  if (entries.length === 0) {
    return {
      changePercentage: null,
      peak: 0,
      peakAt: null,
      yesterdayPeak: null,
    };
  }

  const now = new Date(
    Math.max(...entries.map((entry) => new Date(entry.timestamp).getTime()))
  );
  const oneDayAgo = new Date(now.getTime() - ONE_DAY_MS);
  const twoDaysAgo = new Date(now.getTime() - 2 * ONE_DAY_MS);

  const todayPeak = getPeakEntryInWindow(entries, oneDayAgo, now);
  const yesterdayPeak = getPeakEntryInWindow(entries, twoDaysAgo, oneDayAgo);

  return {
    changePercentage:
      todayPeak && yesterdayPeak && yesterdayPeak.ccu > 0
        ? ((todayPeak.ccu - yesterdayPeak.ccu) / yesterdayPeak.ccu) * 100
        : null,
    peak: todayPeak?.ccu ?? 0,
    peakAt: todayPeak ? new Date(todayPeak.timestamp) : null,
    yesterdayPeak: yesterdayPeak?.ccu ?? null,
  };
}

function RankChangeBadge({ rankChange }: { rankChange: number | null }) {
  if (rankChange === null || rankChange === 0) {
    return null;
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

function LeaderboardCard({
  entries,
  eyebrow,
  icon,
  title,
}: {
  entries: LeaderboardEntry[];
  eyebrow: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Card className="@container/card min-h-96 gap-2 py-3">
      <CardHeader className="gap-0.5 px-3">
        <CardDescription className="flex items-center gap-1 text-xs">
          {icon}
          {eyebrow}
        </CardDescription>
        <CardTitle className="font-semibold text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-3">
        <ItemGroup className="h-full justify-center gap-1">
          {entries.map((entry) => (
            <Item
              asChild
              className="px-1.5 py-1"
              key={entry.universeId}
              size="sm"
            >
              <Link
                href={`https://www.roblox.com/games/${entry.rootPlaceId}`}
                rel="noopener"
                target="_blank"
              >
                <ItemMedia className="size-7" variant="image">
                  {entry.iconUrl ? (
                    <Image
                      alt={`${entry.name} icon`}
                      height={GAME_ICON_SIZE}
                      src={entry.iconUrl}
                      width={GAME_ICON_SIZE}
                    />
                  ) : (
                    <div className="size-full bg-muted" />
                  )}
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle className="line-clamp-1 break-all">
                    {entry.name}
                  </ItemTitle>
                  <ItemDescription className="truncate text-xs">
                    {entry.creatorName ? `@${entry.creatorName}` : " "}
                  </ItemDescription>
                </ItemContent>
                <div className="flex shrink-0 items-center gap-3">
                  {entry.badge}
                  <span className="font-semibold text-muted-foreground text-xs tabular-nums">
                    #{entry.rank}
                  </span>
                </div>
              </Link>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
      <CardFooter className="px-3">
        <Button asChild className="w-full" size="sm" variant="outline">
          <Link href="/dashboard">Explore List</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function TopPlayersCard({ topGames }: { topGames: TopGame[] }) {
  return (
    <LeaderboardCard
      entries={topGames.map((topGame) => ({
        ...topGame,
        badge: <RankChangeBadge rankChange={topGame.rankChange} />,
      }))}
      eyebrow="LEADERBOARD"
      icon={<TrophyIcon className="size-3 fill-yellow-500 text-yellow-500" />}
      title="Top by Players"
    />
  );
}

function TopMoversCard({ topMovers }: { topMovers: TopMover[] }) {
  return (
    <LeaderboardCard
      entries={topMovers.map((topMover) => ({
        ...topMover,
        badge: (
          <Badge
            className="border-green-500/30 bg-green-500/10 text-green-500"
            variant="outline"
          >
            <TrendingUpIcon />
            {topMover.rankShift.toLocaleString()}
          </Badge>
        ),
      }))}
      eyebrow="TRENDING TODAY"
      icon={<FlameIcon className="size-3 fill-orange-500 text-orange-500" />}
      title="Moving in Top 100"
    />
  );
}

export function SectionCards({
  ccuHistory,
  topGames,
  topMovers,
}: {
  ccuHistory: CcuPoint[];
  topGames: TopGame[];
  topMovers: TopMover[];
}) {
  const averageStats = getAverageStatsLast24Hours(ccuHistory);
  const averageMovedUp =
    averageStats.changePercentage !== null &&
    averageStats.changePercentage >= 0;
  const peakStats = getPeakStatsLast24Hours(ccuHistory);
  const peakMovedUp =
    peakStats.changePercentage !== null && peakStats.changePercentage >= 0;
  const peakTime = peakStats.peakAt?.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <div className="grid @3xl/main:grid-cols-[1fr_2fr_2fr] grid-cols-1 gap-4 px-4 **:data-[slot=card]:bg-linear-to-t **:data-[slot=card]:from-primary/5 **:data-[slot=card]:to-card **:data-[slot=card]:shadow-xs lg:px-6 dark:**:data-[slot=card]:bg-card">
      <div className="flex flex-col gap-4">
        <Card className="@container/card flex-1">
          <CardHeader className="flex-1">
            <CardDescription>Total Concurrent Users (CCU)</CardDescription>
            <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
              {averageStats.average.toLocaleString()}
            </CardTitle>
            {averageStats.changePercentage !== null && (
              <CardAction>
                <Badge variant="outline">
                  {averageMovedUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  {averageMovedUp ? "+" : "-"}
                  {Math.abs(averageStats.changePercentage).toFixed(1)}%
                </Badge>
              </CardAction>
            )}
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {averageStats.changePercentage === null
                ? "Average over the last day"
                : `Trending ${averageMovedUp ? "up" : "down"} vs yesterday`}{" "}
              {averageMovedUp ? (
                <TrendingUpIcon className="size-4" />
              ) : (
                <TrendingDownIcon className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">
              Players actively logged in and playing on the platform
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card flex-1">
          <CardHeader className="flex-1">
            <CardDescription>Peak CCU (24h)</CardDescription>
            <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
              {peakStats.peak.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            {peakStats.changePercentage === null ? (
              <div className="line-clamp-1 flex gap-2 font-medium">
                {peakTime ? `Peaked at ${peakTime}` : "No snapshots yet"}
              </div>
            ) : (
              <div className="line-clamp-1 flex gap-2 font-medium">
                {peakMovedUp ? "Up" : "Down"}{" "}
                {Math.abs(peakStats.changePercentage).toFixed(1)}% vs
                yesterday's peak{" "}
                {peakMovedUp ? (
                  <TrendingUpIcon className="size-4" />
                ) : (
                  <TrendingDownIcon className="size-4" />
                )}
              </div>
            )}
            <div className="text-muted-foreground">
              {peakTime ? `Hit at ${peakTime} today` : "Waiting on data"}
              {peakStats.yesterdayPeak === null
                ? ""
                : ` · yesterday peaked at ${peakStats.yesterdayPeak.toLocaleString()}`}
            </div>
          </CardFooter>
        </Card>
      </div>
      <TopPlayersCard topGames={topGames} />
      <TopMoversCard topMovers={topMovers} />
    </div>
  );
}
