import { PaintBucketIcon } from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { ThumbnailEmpty } from "@/components/sections/thumbnails/thumbnail-empty";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Generate | ${siteConfig.name}`,
  description: "Generate AI thumbnails for your Roblox games",
};

export default function GeneratePage() {
  return (
    <AppShell title="Generate">
      <div className="relative isolate flex flex-1 flex-col">
        <div className="aura-container">
          <div className="aura-content">
            <div className="aura-wrapper aura">
              <div className="aura-rays-wrapper aura-rays">
                <div className="aura-blue-element aura-blue" />
              </div>
            </div>
          </div>
        </div>
        <ThumbnailEmpty
          description="Paste a game link or describe your idea and we'll generate a thumbnail for you."
          icon={<PaintBucketIcon />}
          showTutorial
          title="Get started by creating your first thumbnail"
        />
      </div>
    </AppShell>
  );
}
