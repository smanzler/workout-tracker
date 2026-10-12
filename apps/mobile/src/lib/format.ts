import type { SetPerformance } from "@rep/shared";

/** "135 lb × 8", "× 12" without a weight, or "—" when empty. */
export const formatSet = ({ weight, reps }: SetPerformance) => {
  if (weight === null && reps === null) return "—";
  if (weight === null) return `× ${reps}`;
  return `${weight} lb × ${reps ?? "—"}`;
};

export const formatWeight = (weight: number) =>
  `${weight.toLocaleString("en-US")} lb`;

/** The heaviest set, and the one with more reps on a tie. */
export const findBestSet = <TSet extends SetPerformance>(sets: TSet[]) =>
  sets.reduce<TSet | undefined>((best, set) => {
    if (!best) return set;
    const bestWeight = best.weight ?? 0;
    const weight = set.weight ?? 0;
    if (weight !== bestWeight) return weight > bestWeight ? set : best;
    return (set.reps ?? 0) > (best.reps ?? 0) ? set : best;
  }, undefined);
