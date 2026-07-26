import { LibraryBigIcon } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AssetGrid } from "@/components/sections/library/asset-grid";
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
  const session = await auth.api.getSession({ headers: await headers() });
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
            <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 lg:p-6">
              {thumbnails.map((item) => {
                const imageUrl = toImageProxyUrl(item.imagePath);
                return (
                  <a
                    className="group flex flex-col gap-2 overflow-hidden rounded-lg border"
                    href={imageUrl}
                    key={item.id}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Image
                      alt={item.prompt}
                      className="aspect-video w-full object-cover"
                      height={216}
                      src={imageUrl}
                      unoptimized
                      width={384}
                    />
                    <p className="px-3 pb-3 text-muted-foreground text-sm">
                      {item.prompt}
                    </p>
                  </a>
                );
              })}
            </div>
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
