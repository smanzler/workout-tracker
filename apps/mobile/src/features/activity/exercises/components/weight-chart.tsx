import type { SetPerformance } from "@rep/shared";
import NativeChartsView from "../../../../../modules/native-charts/src/NativeChartsView";
import { toWeightPoints } from "../lib/chart";

/** The heaviest weight of each entry over time. */
export function WeightChart({
  entries,
}: {
  entries: { startedAt: Date; sets: SetPerformance[] }[];
}) {
  return (
    <NativeChartsView data={toWeightPoints(entries)} style={{ height: 200 }} />
  );
}
