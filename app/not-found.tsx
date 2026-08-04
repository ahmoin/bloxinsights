import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `Page not found | ${siteConfig.name}`,
};

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="font-semibold text-muted-foreground text-sm">404</p>
        <h1 className="max-w-xl font-semibold text-4xl tracking-tight lg:text-5xl">
          Page not found
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Button asChild size="lg">
          <Link href="/">Back to home</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
