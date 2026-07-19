import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface GameRow {
  creatorName: string | null;
  dateCreated?: string | null;
  name: string;
  playerCount: number;
  rank: number;
  rankChange: number | null;
}

export interface MoverRow {
  creatorName: string | null;
  name: string;
  rank: number;
  rankShift: number;
}

export interface PlatformStatsOutput {
  current: { ccu: number; timestamp: string } | null;
  peak: { ccu: number; timestamp: string };
  snapshotCount: number;
}

function RankChangeBadge({ rankChange }: { rankChange: number | null }) {
  if (rankChange === null || rankChange === 0) {
    return <span className="text-muted-foreground">-</span>;
  }
  const movedUp = rankChange > 0;
  return (
    <Badge
      className={
        movedUp
          ? "border-green-500/30 bg-green-500/10 text-green-500"
          : "border-red-500/30 bg-red-500/10 text-red-500"
      }
      variant="outline"
    >
      {movedUp ? <TrendingUpIcon /> : <TrendingDownIcon />}
      {Math.abs(rankChange)}
    </Badge>
  );
}

export function TopGamesResult({ games }: { games: GameRow[] }) {
  if (games.length === 0) {
    return <p className="text-muted-foreground text-sm">No games found.</p>;
  }

  const showDateCreated = games.some(
    (entry) => entry.dateCreated !== undefined
  );

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Game</TableHead>
            <TableHead className="text-right">Players</TableHead>
            <TableHead className="text-right">Rank Change</TableHead>
            {showDateCreated && (
              <TableHead className="text-right">Created</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((entry) => (
            <TableRow key={entry.name}>
              <TableCell className="font-medium text-muted-foreground">
                #{entry.rank}
              </TableCell>
              <TableCell>
                <div className="font-medium">{entry.name}</div>
                <div className="text-muted-foreground text-xs">
                  {entry.creatorName ? `@${entry.creatorName}` : " "}
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {entry.playerCount.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <RankChangeBadge rankChange={entry.rankChange} />
                </div>
              </TableCell>
              {showDateCreated && (
                <TableCell className="text-right text-muted-foreground">
                  {entry.dateCreated
                    ? new Date(entry.dateCreated).toLocaleDateString()
                    : "-"}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TrendingGamesResult({ movers }: { movers: MoverRow[] }) {
  if (movers.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No trending games found.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Game</TableHead>
            <TableHead className="text-right">Rank Shift</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movers.map((entry) => (
            <TableRow key={entry.name}>
              <TableCell className="font-medium text-muted-foreground">
                #{entry.rank}
              </TableCell>
              <TableCell>
                <div className="font-medium">{entry.name}</div>
                <div className="text-muted-foreground text-xs">
                  {entry.creatorName ? `@${entry.creatorName}` : " "}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <Badge
                    className="border-green-500/30 bg-green-500/10 text-green-500"
                    variant="outline"
                  >
                    <TrendingUpIcon />
                    {entry.rankShift.toLocaleString()}
                  </Badge>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function SearchGamesResult({ games }: { games: GameRow[] }) {
  return <TopGamesResult games={games} />;
}

export function PlatformStatsResult({ current, peak }: PlatformStatsOutput) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg border p-3">
        <div className="text-muted-foreground text-xs">Current CCU</div>
        <div className="font-semibold text-xl tabular-nums">
          {current ? current.ccu.toLocaleString() : "-"}
        </div>
      </div>
      <div className="rounded-lg border p-3">
        <div className="text-muted-foreground text-xs">Peak CCU</div>
        <div className="font-semibold text-xl tabular-nums">
          {peak.ccu.toLocaleString()}
        </div>
        <div className="text-muted-foreground text-xs">
          {new Date(peak.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
