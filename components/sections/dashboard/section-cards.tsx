"use client";

import {
  EyeIcon,
  FlameIcon,
  HeartIcon,
  SparklesIcon,
  ThumbsUpIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icons } from "@/components/icons";
import { ChartAreaInteractive } from "@/components/sections/dashboard/chart-area-interactive";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
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
const COMPACT_NUMBER_THRESHOLD = 1000;

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= COMPACT_NUMBER_THRESHOLD) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
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

function MetricBadge({ value }: { value: number }) {
  return (
    <span className="font-medium text-muted-foreground text-xs tabular-nums">
      {formatCompactNumber(value)}
    </span>
  );
}

function LeaderboardCard({
  entries,
  eyebrow,
  exploreHref,
  icon,
  title,
}: {
  entries: LeaderboardEntry[];
  eyebrow: string;
  exploreHref: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Card className="@container/card gap-2 py-3">
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
          <Link href={exploreHref}>Explore List</Link>
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
      exploreHref="/games?sort=-playing"
      eyebrow="LEADERBOARD"
      icon={<Icons.trophy className="size-3 text-yellow-500" />}
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
      exploreHref="/games?sort=-rank_change_day&rank_max=100"
      eyebrow="TRENDING TODAY"
      icon={<FlameIcon className="size-3 fill-orange-500 text-orange-500" />}
      title="Top Moving Games"
    />
  );
}

function NewestGamesCard({ games }: { games: TopGame[] }) {
  return (
    <LeaderboardCard
      entries={games.map((topGame) => ({ ...topGame, badge: null }))}
      exploreHref="/games?sort=-created"
      eyebrow="TRENDING TODAY"
      icon={<SparklesIcon className="size-3 text-purple-400" />}
      title="New Releases"
    />
  );
}

function TopFavoritedCard({ games }: { games: TopGame[] }) {
  return (
    <LeaderboardCard
      entries={games.map((topGame) => ({
        ...topGame,
        badge: <MetricBadge value={topGame.favoritedCount} />,
      }))}
      exploreHref="/games?sort=-favorites"
      eyebrow="LEADERBOARD"
      icon={<HeartIcon className="size-3 fill-pink-500 text-pink-500" />}
      title="Top by Favorites"
    />
  );
}

function TopVisitedCard({ games }: { games: TopGame[] }) {
  return (
    <LeaderboardCard
      entries={games.map((topGame) => ({
        ...topGame,
        badge: <MetricBadge value={topGame.visits} />,
      }))}
      exploreHref="/games?sort=-visits"
      eyebrow="LEADERBOARD"
      icon={<EyeIcon className="size-3 text-blue-400" />}
      title="Top by Visits"
    />
  );
}

function TopUpVotedCard({ games }: { games: TopGame[] }) {
  return (
    <LeaderboardCard
      entries={games.map((topGame) => ({
        ...topGame,
        badge: <MetricBadge value={topGame.upVotes} />,
      }))}
      exploreHref="/games?sort=-up_votes"
      eyebrow="LEADERBOARD"
      icon={<ThumbsUpIcon className="size-3 text-green-400" />}
      title="Top by Up Votes"
    />
  );
}

function RecentMoversCard({ games }: { games: TopGame[] }) {
  return (
    <LeaderboardCard
      entries={games.map((topGame) => ({
        ...topGame,
        badge: <RankChangeBadge rankChange={topGame.rankChange} />,
      }))}
      exploreHref="/games?sort=-rank_change_day"
      eyebrow="TRENDING NOW"
      icon={<FlameIcon className="size-3 fill-orange-500 text-orange-500" />}
      title="Recent Movers"
    />
  );
}

export function SectionCards({
  ccuHistory,
  newestGames,
  recentMovers,
  topFavorited,
  topGames,
  topMovers,
  topUpVoted,
  topVisited,
}: {
  ccuHistory: CcuPoint[];
  newestGames: TopGame[];
  recentMovers: TopGame[];
  topFavorited: TopGame[];
  topGames: TopGame[];
  topMovers: TopMover[];
  topUpVoted: TopGame[];
  topVisited: TopGame[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-3 lg:px-6">
      <div className="md:col-span-2">
        <ChartAreaInteractive data={ccuHistory} />
      </div>
      <TopMoversCard topMovers={topMovers} />
      <NewestGamesCard games={newestGames} />
      <TopFavoritedCard games={topFavorited} />
      <TopVisitedCard games={topVisited} />
      <TopPlayersCard topGames={topGames} />
      <TopUpVotedCard games={topUpVoted} />
      <RecentMoversCard games={recentMovers} />
    </div>
  );
}
