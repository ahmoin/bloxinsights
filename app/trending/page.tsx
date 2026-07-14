import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { TrendingTable } from "@/components/sections/tables/trending-table";
import { Button } from "@/components/ui/button";
import { getTopMovingGames } from "@/lib/ccu";

const TRENDING_GAMES_LIMIT = 100;

export const dynamic = "force-dynamic";

export default async function Page() {
  const topMovers = await getTopMovingGames(TRENDING_GAMES_LIMIT);
  const today = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <AppShell title="Trending">
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-6">
        <div className="flex flex-col gap-1 px-4 lg:px-6">
          <h1 className="font-semibold text-2xl">Trending Roblox Games</h1>
          <p className="text-muted-foreground text-sm">
            The {topMovers.length} trending Roblox games on {today}
          </p>
        </div>
        <div className="flex flex-col gap-4 px-4 lg:px-6">
          <TrendingTable topMovers={topMovers} />
        </div>
        <div className="px-4 lg:px-6">
          <Button asChild className="w-full" variant="outline">
            <Link href="/games">View All Games</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
