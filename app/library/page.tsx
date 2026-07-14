import { LibraryBigIcon } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ThumbnailEmpty } from "@/components/sections/thumbnails/thumbnail-empty";
import { auth } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { listThumbnails, toImageProxyUrl } from "@/lib/thumbnails";

export const metadata: Metadata = {
  title: `Library | ${siteConfig.name}`,
  description: "Your generated thumbnails",
};

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return redirect("/login");
  }

  const thumbnails = await listThumbnails(session.user.id);

  if (thumbnails.length === 0) {
    return (
      <AppShell title="Library">
        <ThumbnailEmpty
          description="Thumbnails you create will show up here."
          icon={<LibraryBigIcon />}
          title="Your library is empty"
        />
      </AppShell>
    );
  }

  return (
    <AppShell title="Library">
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
    </AppShell>
  );
}
