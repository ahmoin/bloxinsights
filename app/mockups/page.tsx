import { DramaIcon } from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { ThumbnailEmpty } from "@/components/sections/thumbnails/thumbnail-empty";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Mockups | ${siteConfig.name}`,
  description: "Preview your thumbnails in Roblox mockups",
};

export default function MockupsPage() {
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
