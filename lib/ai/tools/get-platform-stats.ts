import { tool } from "ai";
import { z } from "zod";
import { getPlatformCcuHistory } from "@/lib/ccu";

export const getPlatformStats = tool({
  description:
    "Get platform-wide Roblox concurrent player (CCU) stats: the current total, the peak over the tracked history, and when that peak happened. Use this for questions about overall Roblox player counts, not individual games.",
  inputSchema: z.object({}),
  execute: async () => {
    const history = await getPlatformCcuHistory();
    if (history.length === 0) {
      return { error: "No CCU history has been recorded yet." };
    }

    const latest = history.at(-1);
    const peak = history.reduce((max, entry) =>
      entry.ccu > max.ccu ? entry : max
    );

    return {
      current: latest
        ? { ccu: latest.ccu, timestamp: latest.timestamp.toISOString() }
        : null,
      peak: { ccu: peak.ccu, timestamp: peak.timestamp.toISOString() },
      snapshotCount: history.length,
    };
  },
});
