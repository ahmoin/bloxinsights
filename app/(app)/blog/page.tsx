import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 lg:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl">Blog</h1>
          <p className="text-muted-foreground text-sm">
            News, product updates, and notes from the {siteConfig.name} team.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <p className="font-medium">No posts yet</p>
          <p className="text-muted-foreground text-sm">
            Check back soon for updates.
          </p>
        </div>
      </div>
    </div>
  );
}
