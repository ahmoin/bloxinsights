import { PaintBucketIcon } from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { ThumbnailEmpty } from "@/components/thumbnail-empty";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Generate | ${siteConfig.name}`,
  description: "Generate AI thumbnails for your Roblox games",
};

export default function GeneratePage() {
  return (
    <AppShell title="Generate">
      <ThumbnailEmpty
        description="Paste a game link or describe your idea and we'll generate a thumbnail for you."
        icon={<PaintBucketIcon />}
        showTutorial
        title="Get started by creating your first thumbnail"
      />
    </AppShell>
  );
}
