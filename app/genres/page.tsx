import { AppShell } from "@/components/app-shell";
import { GenresTable } from "@/components/sections/tables/genres-table";
import { getGenreSummary } from "@/lib/ccu";

export const dynamic = "force-dynamic";

export default async function Page() {
  const genres = await getGenreSummary();

  return (
    <AppShell title="Genres">
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-6">
        <div className="flex flex-col gap-1 px-4 lg:px-6">
          <h1 className="font-semibold text-2xl">All Genres</h1>
          <p className="text-muted-foreground text-sm">
            Roblox game genres ranked by total Players (CCU)
          </p>
        </div>
        <div className="flex flex-col gap-4 px-4 lg:px-6">
          <GenresTable genres={genres} />
        </div>
      </div>
    </AppShell>
  );
}
