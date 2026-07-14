import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { TopTable } from "@/components/sections/tables/top-table";
import { Button } from "@/components/ui/button";
import { type GamesListSort, getGamesList } from "@/lib/ccu";

const TOP_GAMES_LIMIT = 100;
const DEFAULT_SORT: GamesListSort = "-playing";

const VALID_SORTS = new Set<GamesListSort>([
  "-playing",
  "-visits",
  "-favorites",
  "-rank_change_day",
]);

function isValidSort(value: string | undefined): value is GamesListSort {
  return value !== undefined && VALID_SORTS.has(value as GamesListSort);
}

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sort = isValidSort(params.sort) ? params.sort : DEFAULT_SORT;

  const { games } = await getGamesList({ pageSize: TOP_GAMES_LIMIT, sort });
  const today = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <AppShell title="Top">
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-6">
        <div className="flex flex-col gap-1 px-4 lg:px-6">
          <h1 className="font-semibold text-2xl">Top Roblox Games</h1>
          <p className="text-muted-foreground text-sm">
            The top Roblox games by Players (CCU) on {today}
          </p>
        </div>
        <div className="flex flex-col gap-4 px-4 lg:px-6">
          <TopTable games={games} sort={sort} />
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
