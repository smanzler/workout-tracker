import { metricValues, type SetPerformance } from "@rep/shared";

/** The heaviest weight of each entry, oldest first, at seconds since 1970. */
export const toWeightPoints = (
  entries: { startedAt: Date; sets: SetPerformance[] }[],
) =>
  entries
    .map(({ startedAt, sets }) => ({
      x: startedAt.getTime() / 1000,
      y: Math.max(0, ...sets.map(metricValues.weight)),
    }))
    .sort((a, b) => a.x - b.x);
