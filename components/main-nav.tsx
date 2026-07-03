"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MainNav({
  items,
  className,
  ...props
}: ComponentProps<"nav"> & {
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("items-center gap-0", className)} {...props}>
      {items.map((item) => (
        <Button
          asChild
          className="px-2.5 hover:bg-transparent hover:text-primary dark:hover:bg-transparent"
          key={item.href}
          size="sm"
          variant="ghost"
        >
          <Link
            className="relative items-center"
            data-active={pathname === item.href}
            href={item.href}
          >
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
