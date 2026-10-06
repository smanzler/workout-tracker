export type SetPerformance = {
  weight: number | null;
  reps: number | null;
};

export type PersonalRecordFlags = {
  isWeightPr: boolean;
  isVolumePr: boolean;
  isOneRepMaxPr: boolean;
};

export type PersonalRecordMetric = "weight" | "volume" | "oneRepMax";

/** Epley formula: weight × (1 + reps / 30). */
export const estimateOneRepMax = ({ weight, reps }: SetPerformance) =>
  (weight ?? 0) * (1 + (reps ?? 0) / 30);

export const metricValues: Record<
  PersonalRecordMetric,
  (set: SetPerformance) => number
> = {
  weight: ({ weight }) => weight ?? 0,
  volume: ({ weight, reps }) => (weight ?? 0) * (reps ?? 0),
  oneRepMax: estimateOneRepMax,
};

type Bests = Record<PersonalRecordMetric, number>;

type Best = { index: number; value: number };

const findBest = (
  sets: SetPerformance[],
  metric: PersonalRecordMetric,
  previous: number,
) =>
  sets.reduce<Best>(
    (best, set, index) => {
      const value = metricValues[metric](set);
      return value > best.value ? { index, value } : best;
    },
    { index: -1, value: previous },
  );

const findBests = (
  sets: SetPerformance[],
  previous: Bests,
): Record<PersonalRecordMetric, Best> => ({
  weight: findBest(sets, "weight", previous.weight),
  volume: findBest(sets, "volume", previous.volume),
  oneRepMax: findBest(sets, "oneRepMax", previous.oneRepMax),
});

/**
 * Marks the sets that beat every earlier entry of one exercise.
 *
 * Pass the entries in the order they happened, and each entry's sets in the
 * order they were done. In an entry, at most one set gets each flag: the
 * highest one, or the first of equal ones.
 */
export const markPersonalRecords = <TSet extends SetPerformance>(
  entries: TSet[][],
) =>
  entries.reduce<{ bests: Bests; marked: (TSet & PersonalRecordFlags)[][] }>(
    ({ bests, marked }, sets) => {
      const entryBests = findBests(sets, bests);

      return {
        bests: {
          weight: entryBests.weight.value,
          volume: entryBests.volume.value,
          oneRepMax: entryBests.oneRepMax.value,
        },
        marked: [
          ...marked,
          sets.map((set, index) => ({
            ...set,
            isWeightPr: entryBests.weight.index === index,
            isVolumePr: entryBests.volume.index === index,
            isOneRepMaxPr: entryBests.oneRepMax.index === index,
          })),
        ],
      };
    },
    { bests: { weight: 0, volume: 0, oneRepMax: 0 }, marked: [] },
  ).marked;
