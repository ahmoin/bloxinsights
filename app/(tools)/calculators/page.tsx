import type { Metadata } from "next";
import { Calculators } from "@/components/sections/calculators/calculators";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Calculators | ${siteConfig.name}`,
  description: "Convert Robux to USD and calculate Roblox marketplace tax.",
};

export default function CalculatorsPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Calculators />
      </main>
      <SiteFooter />
    </div>
  );
}
