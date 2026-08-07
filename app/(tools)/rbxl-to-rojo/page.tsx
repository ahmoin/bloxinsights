import type { Metadata } from "next";
import { RbxlToRojoUploader } from "@/components/sections/rbxl-to-rojo/uploader";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `RBXL to Rojo | ${siteConfig.name}`,
  description: "Convert a Roblox place file into a Rojo project",
};

export default function RbxlToRojoPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <RbxlToRojoUploader />
      </main>
      <SiteFooter />
    </div>
  );
}
