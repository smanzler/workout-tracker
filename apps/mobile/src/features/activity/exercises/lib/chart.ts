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

/**
 * The position of each value on a chart of `width` × `height`. The points are
 * spaced evenly and keep `inset` from each edge.
 */
export const layoutPoints = (
  values: number[],
  { width, height, inset }: { width: number; height: number; inset: number },
) => {
  const min = Math.min(...values);
  const span = Math.max(...values) - min;
  const step = (width - inset * 2) / Math.max(1, values.length - 1);

  return values.map((value, index) => ({
    x: values.length === 1 ? width / 2 : inset + index * step,
    y:
      span === 0
        ? height / 2
        : inset + (1 - (value - min) / span) * (height - inset * 2),
  }));
};

/** The index of the point nearest to `x`, for points that `layoutPoints` spaced. */
export const findNearestIndex = (
  x: number,
  { count, width, inset }: { count: number; width: number; inset: number },
) => {
  "worklet";
  const step = (width - inset * 2) / Math.max(1, count - 1);
  return Math.min(count - 1, Math.max(0, Math.round((x - inset) / step)));
};
