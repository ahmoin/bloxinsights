import { AppShell } from "@/components/app-shell";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import {
  getPlatformCcuHistory,
  getTopGamesByPlayers,
  getTopMovingGames,
} from "@/lib/ccu";

import data from "./data.json";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [history, topGames, topMovers] = await Promise.all([
    getPlatformCcuHistory(),
    getTopGamesByPlayers(),
    getTopMovingGames(),
  ]);
  const ccuHistory = history.map((row) => ({
    timestamp: row.timestamp.toISOString(),
    ccu: row.ccu,
  }));

  return (
    <AppShell title="Home">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards
            ccuHistory={ccuHistory}
            topGames={topGames}
            topMovers={topMovers}
          />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive data={ccuHistory} />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </AppShell>
  );
}
