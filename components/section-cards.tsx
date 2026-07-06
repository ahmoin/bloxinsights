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

interface LeaderboardEntry {
  badge: ReactNode;
  creatorName: string | null;
  iconUrl: string | null;
  name: string;
  rank: number;
  rootPlaceId: number;
  universeId: number;
}

function getAverageCCULast24Hours(entries: CcuPoint[]): number {
  if (entries.length === 0) {
    return 0;
  }

  const now = new Date(
    Math.max(...entries.map((entry) => new Date(entry.timestamp).getTime()))
  );
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const last24hEntries = entries.filter((entry) => {
    const date = new Date(entry.timestamp);
    return date >= oneDayAgo && date <= now;
  });

  if (last24hEntries.length === 0) {
    return 0;
  }

  const total = last24hEntries.reduce((sum, entry) => sum + entry.ccu, 0);
  return Math.round(total / last24hEntries.length);
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
    <Card className="@container/card gap-2 self-start py-3">
      <CardHeader className="gap-0.5 px-3">
        <CardDescription className="flex items-center gap-1 text-xs">
          {icon}
          {eyebrow}
        </CardDescription>
        <CardTitle className="font-semibold text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <ItemGroup className="gap-0.5">
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
                <ItemMedia variant="image">
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
                <ItemContent>
                  <ItemTitle>{entry.name}</ItemTitle>
                  <ItemDescription>
                    {entry.creatorName ? `@${entry.creatorName}` : " "}
                  </ItemDescription>
                </ItemContent>
                <div className="flex items-center gap-3">
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
      icon={<TrophyIcon className="size-3 text-yellow-500" />}
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
      icon={<FlameIcon className="size-3 text-orange-500" />}
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
  const averageCCU = getAverageCCULast24Hours(ccuHistory);
  return (
    <div className="grid @5xl/main:grid-cols-3 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card self-start">
        <CardHeader>
          <CardDescription>Total Concurrent Users (CCU)</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {averageCCU.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Players actively logged in and playing on the platform
          </div>
        </CardFooter>
      </Card>
      <TopPlayersCard topGames={topGames} />
      <TopMoversCard topMovers={topMovers} />
    </div>
  );
}
