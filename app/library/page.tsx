import { LibraryBigIcon } from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { ThumbnailEmpty } from "@/components/thumbnail-empty";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Library | ${siteConfig.name}`,
  description: "Your generated thumbnails",
};

export default function LibraryPage() {
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
