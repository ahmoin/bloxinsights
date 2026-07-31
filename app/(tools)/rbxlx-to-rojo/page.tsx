import type { Metadata } from "next";
import { RbxlxToRojoUploader } from "@/components/sections/rbxlx-to-rojo/uploader";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `RBXLX to Rojo | ${siteConfig.name}`,
  description: "Convert a Roblox place file into a Rojo project",
};

export default function RbxlxToRojoPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <RbxlxToRojoUploader />
      </main>
      <SiteFooter />
    </div>
  );
}
