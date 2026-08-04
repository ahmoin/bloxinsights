import type { Metadata } from "next";
import { FeatureShowcase } from "@/components/sections/features/feature-showcase";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Features | ${siteConfig.name}`,
  description:
    "Everything Bloxinsights gives you for tracking and growing Roblox games.",
};

export default function FeaturesPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <FeatureShowcase />
    </div>
  );
}
