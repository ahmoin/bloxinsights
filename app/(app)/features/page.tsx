import type { Metadata } from "next";
import { FeatureShowcase } from "@/components/sections/features/feature-showcase";
import { getFeatureShowcaseData, getTopGameThumbnails } from "@/lib/ccu";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Features | ${siteConfig.name}`,
  description:
    "Everything Bloxinsights gives you for tracking and growing Roblox games.",
};

export default async function FeaturesPage() {
  const [showcaseData, topGameThumbnails] = await Promise.all([
    getFeatureShowcaseData(),
    getTopGameThumbnails(),
  ]);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <FeatureShowcase
        showcaseData={showcaseData}
        topGameThumbnails={topGameThumbnails}
      />
    </div>
  );
}
