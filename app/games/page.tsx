import { AppShell } from "@/components/app-shell";
import { GamesColumnsMenu } from "@/components/sections/games/games-columns-menu";
import { GamesTable } from "@/components/sections/tables/games-table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  type GamesListSort,
  type GamesListSortField,
  getGamesList,
} from "@/lib/ccu";
import {
  DEFAULT_GAMES_METRIC_COLUMNS,
  GAMES_METRIC_COLUMNS,
} from "@/lib/games-columns";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const PAGE_WINDOW = 1;
const DEFAULT_SORT: GamesListSort = "-playing";

const SORT_FIELDS = new Set<GamesListSortField>([
  "created",
  "down_votes",
  "favorites",
  "playing",
  "rank_change_day",
  "up_votes",
  "visits",
]);

function isGamesListSort(value: string | undefined): value is GamesListSort {
  if (!value) {
    return false;
  }
  const field = value.startsWith("-") ? value.slice(1) : value;
  return SORT_FIELDS.has(field as GamesListSortField);
}

function nextSort(
  field: GamesListSortField,
  currentSort: GamesListSort
): GamesListSort {
  const desc = `-${field}` as GamesListSort;
  return currentSort === desc ? field : desc;
}

function buildGamesHref({
  columns,
  page,
  pageSize,
  rankMax,
  sort,
}: {
  columns: string[];
  page: number;
  pageSize: number;
  rankMax?: number;
  sort: GamesListSort;
}): string {
  const query = new URLSearchParams({ sort });
  if (page > 1) {
    query.set("page", String(page));
  }
  if (pageSize !== DEFAULT_PAGE_SIZE) {
    query.set("page_size", String(pageSize));
  }
  if (rankMax) {
    query.set("rank_max", String(rankMax));
  }
  if (columns.length > 0) {
    query.set("columns", columns.join(","));
  }
  return `/games?${query.toString()}`;
}

function parsePageSize(value: string | undefined): number {
  const requested = value ? Number(value) : DEFAULT_PAGE_SIZE;
  return Number.isFinite(requested) && requested > 0
    ? Math.min(requested, MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;
}

function parsePage(value: string | undefined): number {
  const requested = value ? Number(value) : 1;
  return Number.isFinite(requested) && requested > 0
    ? Math.floor(requested)
    : 1;
}

function parseRankMax(value: string | undefined): number | undefined {
  const requested = value ? Number(value) : undefined;
  return requested && Number.isFinite(requested) && requested > 0
    ? requested
    : undefined;
}

function parseColumns(value: string | undefined): string[] {
  const validKeys = new Set(GAMES_METRIC_COLUMNS.map((column) => column.key));
  const requested = value?.split(",").filter((key) => validKeys.has(key));
  return requested && requested.length > 0
    ? requested
    : DEFAULT_GAMES_METRIC_COLUMNS;
}

type PageToken = number | "ellipsis";

function buildPageTokens(page: number, pageCount: number): PageToken[] {
  const tokens: number[] = [];
  const addPage = (value: number) => {
    if (value >= 1 && value <= pageCount && !tokens.includes(value)) {
      tokens.push(value);
    }
  };

  addPage(1);
  for (
    let value = page - PAGE_WINDOW;
    value <= page + PAGE_WINDOW;
    value += 1
  ) {
    addPage(value);
  }
  addPage(pageCount);

  const withEllipsis: PageToken[] = [];
  let previous: number | null = null;
  for (const token of tokens) {
    if (previous !== null && token - previous > 1) {
      withEllipsis.push("ellipsis");
    }
    withEllipsis.push(token);
    previous = token;
  }
  return withEllipsis;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    columns?: string;
    page?: string;
    page_size?: string;
    rank_max?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const sort = isGamesListSort(params.sort) ? params.sort : DEFAULT_SORT;
  const validRankMax = parseRankMax(params.rank_max);
  const pageSize = parsePageSize(params.page_size);
  const page = parsePage(params.page);
  const columns = parseColumns(params.columns);
  const visibleColumns = new Set(columns);

  const { games, total } = await getGamesList({
    page,
    pageSize,
    rankMax: validRankMax,
    sort,
  });

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);
  const pageTokens = buildPageTokens(currentPage, pageCount);

  const hrefFor = (targetPage: number) =>
    buildGamesHref({
      columns,
      page: targetPage,
      pageSize,
      rankMax: validRankMax,
      sort,
    });

  const hrefForSort = (field: GamesListSortField) =>
    buildGamesHref({
      columns,
      page: 1,
      pageSize,
      rankMax: validRankMax,
      sort: nextSort(field, sort),
    });

  return (
    <AppShell title="Games">
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-6">
        <div className="flex items-center justify-end px-4 lg:px-6">
          <GamesColumnsMenu visibleColumns={columns} />
        </div>
        <div className="overflow-hidden rounded-lg border px-4 lg:px-6">
          <GamesTable
            currentSort={sort}
            games={games}
            hrefForSort={hrefForSort}
            visibleColumns={visibleColumns}
          />
        </div>
        <div className="flex flex-col items-center justify-between gap-2 px-4 sm:flex-row lg:px-6">
          <div className="text-muted-foreground text-sm">
            {total === 0
              ? "No games"
              : `${rangeStart.toLocaleString()}-${rangeEnd.toLocaleString()} of ${total.toLocaleString()} games`}
          </div>
          <Pagination className="mx-0 w-fit">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={currentPage <= 1}
                  className={
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                  href={hrefFor(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>
              {pageTokens.map((token, index) =>
                token === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index.toString()}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={token}>
                    <PaginationLink
                      href={hrefFor(token)}
                      isActive={token === currentPage}
                      size="icon-sm"
                    >
                      {token}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  aria-disabled={currentPage >= pageCount}
                  className={
                    currentPage >= pageCount
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                  href={hrefFor(Math.min(pageCount, currentPage + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </AppShell>
  );
}
