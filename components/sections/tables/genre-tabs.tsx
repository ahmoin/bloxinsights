import Link from "next/link";
import type { GamesListSort, GenreSummary } from "@/lib/ccu";
import { cn } from "@/lib/utils";

function buildHref(sort: GamesListSort, genre?: string): string {
  const params = new URLSearchParams({ sort });
  if (genre) {
    params.set("genre", genre);
  }
  return `/top?${params.toString()}`;
}

export function GenreTabs({
  genre,
  genres,
  sort,
}: {
  genre?: string;
  genres: GenreSummary[];
  sort: GamesListSort;
}) {
  const tabs = [
    { genre: undefined, label: "All Genres" },
    ...genres.map((entry) => ({ genre: entry.genre, label: entry.genre })),
  ];

  return (
    <div className="scrollbar-none flex gap-4 overflow-x-auto border-b">
      {tabs.map((tab) => {
        const isActive = tab.genre === genre;
        return (
          <Link
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-1 pb-2 font-medium text-sm transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            href={buildHref(sort, tab.genre)}
            key={tab.label}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
