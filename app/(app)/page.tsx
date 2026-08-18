import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SectionCards } from "@/components/sections/dashboard/section-cards";
import { GamesTable } from "@/components/sections/tables/games-table";
import { auth } from "@/lib/auth";
import {
  getGamesList,
  getPlatformCcuHistory,
  getTopGamesByPlayers,
  getTopMovingGames,
} from "@/lib/ccu";
import { DEFAULT_GAMES_METRIC_COLUMNS } from "@/lib/games-columns";

const TOP_GAMES_LIMIT = 10;
const LEADERBOARD_LIMIT = 5;

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    return redirect("/dashboard");
  }

  const [
    history,
    topGames,
    topMovers,
    topGamesList,
    newestGames,
    topFavorited,
    topVisited,
    topUpVoted,
    recentMovers,
  ] = await Promise.all([
    getPlatformCcuHistory(),
    getTopGamesByPlayers(),
    getTopMovingGames(),
    getGamesList({ pageSize: TOP_GAMES_LIMIT, sort: "-playing" }),
    getGamesList({ pageSize: LEADERBOARD_LIMIT, sort: "-created" }),
    getGamesList({ pageSize: LEADERBOARD_LIMIT, sort: "-favorites" }),
    getGamesList({ pageSize: LEADERBOARD_LIMIT, sort: "-visits" }),
    getGamesList({ pageSize: LEADERBOARD_LIMIT, sort: "-up_votes" }),
    getGamesList({ pageSize: LEADERBOARD_LIMIT, sort: "-rank_change_day" }),
  ]);
  const ccuHistory = history.map((row) => ({
    timestamp: row.timestamp.toISOString(),
    ccu: row.ccu,
  }));

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex flex-col gap-1 px-4 text-center lg:px-6">
          <h1 className="font-semibold text-2xl">
            What&apos;s trending on Roblox?
          </h1>
          <p className="text-muted-foreground text-sm">
            Live player counts, rankings, and momentum across the platform.
          </p>
        </div>
        <SectionCards
          ccuHistory={ccuHistory}
          newestGames={newestGames.games}
          recentMovers={recentMovers.games}
          topFavorited={topFavorited.games}
          topGames={topGames}
          topMovers={topMovers}
          topUpVoted={topUpVoted.games}
          topVisited={topVisited.games}
        />
        <div className="flex flex-col gap-4 px-4 lg:px-6">
          <h2 className="font-semibold text-lg">Top 10 Games by CCU</h2>
          <div className="overflow-hidden rounded-lg border">
            <GamesTable
              games={topGamesList.games}
              visibleColumns={new Set(DEFAULT_GAMES_METRIC_COLUMNS)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
