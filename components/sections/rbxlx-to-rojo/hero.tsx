import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

export function RbxlxToRojoHero() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center gap-8 px-6 py-24 text-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>RBXLX to Rojo</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="max-w-3xl font-semibold text-5xl tracking-tight">
          .rbxlx/.rbxl to Rojo
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Convert a Roblox place file into a Rojo project, entirely in your
          browser. Sign in to upload a file and get your project back as a zip.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Convert a file</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
