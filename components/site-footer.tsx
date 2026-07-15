import Link from "next/link";

import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="3xl:fixed:bg-transparent group-has-data-[slot=designer]/body:hidden group-has-data-[slot=docs]/body:hidden group-has-[.section-soft]/body:bg-surface/40 group-has-[.docs-nav]/body:pb-20 group-has-[.docs-nav]/body:sm:pb-0 dark:bg-transparent dark:group-has-[.section-soft]/body:bg-surface/40">
      <div className="container-wrapper px-4 xl:px-6">
        <div className="flex items-center justify-between py-8">
          <div className="flex w-full flex-col items-center px-1 text-center text-muted-foreground text-xs leading-loose sm:text-sm">
            <div className="grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-4">
              <div>
                <h3 className="mb-4 font-bold text-foreground text-lg">
                  {siteConfig.name}
                </h3>
                <p className="text-pretty text-muted-foreground text-sm">
                  {siteConfig.description}
                </p>
              </div>
              <div>
                <h4 className="mb-3 font-semibold text-foreground">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      className="text-muted-foreground hover:text-foreground"
                      href="/features"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-muted-foreground hover:text-foreground"
                      href="/pricing"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-muted-foreground hover:text-foreground"
                      href="/security"
                    >
                      Security
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-3 font-semibold text-foreground">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      className="text-muted-foreground hover:text-foreground"
                      href="/about"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-muted-foreground hover:text-foreground"
                      href="/blog"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-muted-foreground hover:text-foreground"
                      href="/contact"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-3 font-semibold text-foreground">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      className="text-muted-foreground hover:text-foreground"
                      href="/privacy"
                    >
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-muted-foreground hover:text-foreground"
                      href="/terms"
                    >
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="my-8 w-full border-border border-t pt-8 text-center text-muted-foreground text-sm">
              <p>&copy; 2026 {siteConfig.name}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
