import type { CSSProperties } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DashboardHeader } from "@/components/dashboard-header";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col">
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
