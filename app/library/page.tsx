import { LibraryBigIcon } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AssetGrid } from "@/components/sections/library/asset-grid";
import { ThumbnailGrid } from "@/components/sections/library/thumbnail-grid";
import { ThumbnailEmpty } from "@/components/sections/thumbnails/thumbnail-empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listAssets, toAssetImageProxyUrl } from "@/lib/assets";
import { auth } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { listThumbnails, toImageProxyUrl } from "@/lib/thumbnails";

export const metadata: Metadata = {
  title: `Library | ${siteConfig.name}`,
  description: "Your generated thumbnails and uploaded assets",
};

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect("/login");
  }

  const [thumbnails, assets] = await Promise.all([
    listThumbnails(session.user.id),
    listAssets(session.user.id),
  ]);

  return (
    <AppShell title="Library">
      <Tabs className="flex flex-1 flex-col gap-0" defaultValue="thumbnails">
        <TabsList className="mx-4 mt-4 w-fit lg:mx-6 lg:mt-6">
          <TabsTrigger value="thumbnails">Thumbnails</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>
        <TabsContent className="flex flex-1 flex-col" value="thumbnails">
          {thumbnails.length === 0 ? (
            <ThumbnailEmpty
              description="Thumbnails you create will show up here."
              icon={<LibraryBigIcon />}
              title="Your library is empty"
            />
          ) : (
            <ThumbnailGrid
              initialThumbnails={thumbnails.map((item) => ({
                id: item.id,
                imageUrl: toImageProxyUrl(item.imagePath),
                prompt: item.prompt,
              }))}
            />
          )}
        </TabsContent>
        <TabsContent className="flex flex-1 flex-col" value="assets">
          <AssetGrid
            initialAssets={assets.map((asset) => ({
              createdAt: asset.createdAt.toISOString(),
              id: asset.id,
              imageUrl: toAssetImageProxyUrl(asset.path),
              name: asset.name,
              path: asset.path,
            }))}
          />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
