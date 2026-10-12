import type { SetPerformance } from "@rep/shared";
import { findBestSet } from "@/lib/format";

/** The best set of each of the last `limit` entries, oldest first. */
export const toChartPoints = <
  TEntry extends { startedAt: Date; sets: SetPerformance[] },
>(
  entries: TEntry[],
  limit: number,
) =>
  [...entries]
    .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
    .slice(-limit)
    .flatMap((entry) => {
      const bestSet = findBestSet(entry.sets);
      return bestSet ? [{ entry, bestSet, value: bestSet.weight ?? 0 }] : [];
    });
