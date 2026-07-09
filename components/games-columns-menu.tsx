"use client";

import { ChevronDownIcon, TableIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GAMES_METRIC_COLUMNS } from "@/lib/games-columns";

export function GamesColumnsMenu({
  visibleColumns,
}: {
  visibleColumns: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = new Set(visibleColumns);

  function toggleColumn(key: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("columns", [...next].join(","));
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          <TableIcon data-icon="inline-start" />
          Metrics ({selected.size}/{GAMES_METRIC_COLUMNS.length})
          <ChevronDownIcon data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {GAMES_METRIC_COLUMNS.map((column) => (
          <DropdownMenuCheckboxItem
            checked={selected.has(column.key)}
            key={column.key}
            onCheckedChange={(checked) => toggleColumn(column.key, !!checked)}
            onSelect={(event) => event.preventDefault()}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
