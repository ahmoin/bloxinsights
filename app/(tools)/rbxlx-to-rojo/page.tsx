import type { Metadata } from "next";
import { headers } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { RbxlxToRojoHero } from "@/components/sections/rbxlx-to-rojo/hero";
import { RbxlxToRojoUploader } from "@/components/sections/rbxlx-to-rojo/uploader";
import { getSessionSafe } from "@/lib/auth";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `RBXLX to Rojo | ${siteConfig.name}`,
  description: "Convert a Roblox place file into a Rojo project",
};

export default async function RbxlxToRojoPage() {
  const session = await getSessionSafe(await headers());

  if (!session) {
    return <RbxlxToRojoHero />;
  }

  return (
    <AppShell title="RBXLX to Rojo">
      <RbxlxToRojoUploader />
    </AppShell>
  );
}
