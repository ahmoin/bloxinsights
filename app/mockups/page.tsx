import { DramaIcon } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MockupsView } from "@/components/sections/mockups/mockups-view";
import { ThumbnailEmpty } from "@/components/sections/thumbnails/thumbnail-empty";
import { auth } from "@/lib/auth";
import { getTopGamesByPlayers } from "@/lib/ccu";
import { siteConfig } from "@/lib/config";
import { fetchGameThumbnails } from "@/lib/roblox";
import { listThumbnails, toImageProxyUrl } from "@/lib/thumbnails";

const MOCKUP_GAMES_LIMIT = 10;

export const metadata: Metadata = {
  title: `Mockups | ${siteConfig.name}`,
  description: "Preview your thumbnails in Roblox mockups",
};

export const dynamic = "force-dynamic";

export default async function MockupsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return redirect("/login");
  }

  const thumbnails = await listThumbnails(session.user.id);

  if (thumbnails.length === 0) {
    return (
      <AppShell title="Mockups">
        <ThumbnailEmpty
          description="Create a thumbnail to preview how it looks on the Roblox games page."
          icon={<DramaIcon />}
          title="No mockups yet"
        />
      </AppShell>
    );
  }

  const topGames = await getTopGamesByPlayers(MOCKUP_GAMES_LIMIT);
  const thumbnailsByUniverseId = await fetchGameThumbnails(
    topGames.map((entry) => entry.universeId)
  );
  const games = topGames.map((entry) => ({
    universeId: entry.universeId,
    name: entry.name,
    thumbnailUrl: thumbnailsByUniverseId.get(entry.universeId) ?? null,
  }));

  return (
    <AppShell title="Mockups">
      <MockupsView
        games={games}
        thumbnails={thumbnails.map((item) => ({
          id: item.id,
          imageUrl: toImageProxyUrl(item.imagePath),
          prompt: item.prompt,
        }))}
      />
    </AppShell>
  );
}
