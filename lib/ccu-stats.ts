import type { CcuPoint } from "@/lib/ccu";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface AverageStats {
  average: number;
  changePercentage: number | null;
}

export interface PeakStats {
  changePercentage: number | null;
  peak: number;
  peakAt: Date | null;
  yesterdayPeak: number | null;
}

function getAverageInWindow(
  entries: CcuPoint[],
  start: Date,
  end: Date
): number | null {
  let total = 0;
  let count = 0;
  for (const entry of entries) {
    const date = new Date(entry.timestamp);
    if (date < start || date > end) {
      continue;
    }
    total += entry.ccu;
    count += 1;
  }
  return count === 0 ? null : Math.round(total / count);
}

export function getAverageStatsLast24Hours(entries: CcuPoint[]): AverageStats {
  if (entries.length === 0) {
    return { average: 0, changePercentage: null };
  }

  const now = new Date(
    Math.max(...entries.map((entry) => new Date(entry.timestamp).getTime()))
  );
  const oneDayAgo = new Date(now.getTime() - ONE_DAY_MS);
  const twoDaysAgo = new Date(now.getTime() - 2 * ONE_DAY_MS);

  const average = getAverageInWindow(entries, oneDayAgo, now) ?? 0;
  const previousAverage = getAverageInWindow(entries, twoDaysAgo, oneDayAgo);

  return {
    average,
    changePercentage:
      previousAverage === null || previousAverage === 0
        ? null
        : ((average - previousAverage) / previousAverage) * 100,
  };
}

function getPeakEntryInWindow(
  entries: CcuPoint[],
  start: Date,
  end: Date
): CcuPoint | null {
  let peakEntry: CcuPoint | null = null;
  for (const entry of entries) {
    const date = new Date(entry.timestamp);
    if (date < start || date > end) {
      continue;
    }
    if (peakEntry === null || entry.ccu > peakEntry.ccu) {
      peakEntry = entry;
    }
  }
  return peakEntry;
}

export function getPeakStatsLast24Hours(entries: CcuPoint[]): PeakStats {
  if (entries.length === 0) {
    return {
      changePercentage: null,
      peak: 0,
      peakAt: null,
      yesterdayPeak: null,
    };
  }

  const now = new Date(
    Math.max(...entries.map((entry) => new Date(entry.timestamp).getTime()))
  );
  const oneDayAgo = new Date(now.getTime() - ONE_DAY_MS);
  const twoDaysAgo = new Date(now.getTime() - 2 * ONE_DAY_MS);

  const todayPeak = getPeakEntryInWindow(entries, oneDayAgo, now);
  const yesterdayPeak = getPeakEntryInWindow(entries, twoDaysAgo, oneDayAgo);

  return {
    changePercentage:
      todayPeak && yesterdayPeak && yesterdayPeak.ccu > 0
        ? ((todayPeak.ccu - yesterdayPeak.ccu) / yesterdayPeak.ccu) * 100
        : null,
    peak: todayPeak?.ccu ?? 0,
    peakAt: todayPeak ? new Date(todayPeak.timestamp) : null,
    yesterdayPeak: yesterdayPeak?.ccu ?? null,
  };
}
