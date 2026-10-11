import { describe, expect, test } from "vitest";
import {
  estimateOneRepMax,
  markPersonalRecords,
  summarizePersonalRecords,
} from "./personal-records";

const set = (weight: number | null, reps: number | null) => ({ weight, reps });

const flags = (entries: ReturnType<typeof markPersonalRecords>) =>
  entries.map((sets) =>
    sets.map(({ isWeightPr, isVolumePr, isOneRepMaxPr }) => ({
      isWeightPr,
      isVolumePr,
      isOneRepMaxPr,
    })),
  );

const none = { isWeightPr: false, isVolumePr: false, isOneRepMaxPr: false };
const all = { isWeightPr: true, isVolumePr: true, isOneRepMaxPr: true };

describe("estimateOneRepMax", () => {
  test("uses the Epley formula", () => {
    expect(estimateOneRepMax(set(100, 10))).toBeCloseTo(133.33, 2);
  });

  test("counts a missing weight or reps as 0", () => {
    expect(estimateOneRepMax(set(null, 10))).toBe(0);
    expect(estimateOneRepMax(set(100, null))).toBe(100);
  });
});

describe("markPersonalRecords", () => {
  test("marks the best set of the first entry", () => {
    const marked = markPersonalRecords([[set(100, 5), set(120, 5)]]);

    expect(flags(marked)).toEqual([[none, all]]);
  });

  test("marks nothing when an entry does not beat an earlier one", () => {
    const marked = markPersonalRecords([[set(120, 5)], [set(100, 5)]]);

    expect(flags(marked)[1]).toEqual([none]);
  });

  test("marks each metric on the set that sets it", () => {
    const marked = markPersonalRecords([
      [set(100, 5)],
      [set(110, 1), set(90, 10)],
    ]);

    expect(flags(marked)[1]).toEqual([
      { isWeightPr: true, isVolumePr: false, isOneRepMaxPr: false },
      { isWeightPr: false, isVolumePr: true, isOneRepMaxPr: true },
    ]);
  });

  test("marks only the highest set when several beat the earlier best", () => {
    const marked = markPersonalRecords([
      [set(100, 5)],
      [set(105, 5), set(110, 5)],
    ]);

    expect(flags(marked)[1]).toEqual([none, all]);
  });

  test("does not mark a tie with an earlier entry", () => {
    const marked = markPersonalRecords([[set(100, 5)], [set(100, 5)]]);

    expect(flags(marked)[1]).toEqual([none]);
  });

  test("marks the first of equal sets in one entry", () => {
    const marked = markPersonalRecords([[set(100, 5), set(100, 5)]]);

    expect(flags(marked)).toEqual([[all, none]]);
  });

  test("never marks sets without a weight", () => {
    const marked = markPersonalRecords([[set(null, 12), set(null, 15)]]);

    expect(flags(marked)).toEqual([[none, none]]);
  });

  test("keeps the other properties of each set", () => {
    const [entry] = markPersonalRecords([[{ id: "a", ...set(50, 5) }]]);

    expect(entry?.[0]).toMatchObject({ id: "a", weight: 50, reps: 5 });
  });
});

describe("summarizePersonalRecords", () => {
  const monday = new Date("2026-01-05");
  const friday = new Date("2026-01-09");

  test("finds the best value of each metric and when it happened", () => {
    const records = summarizePersonalRecords([
      { startedAt: friday, sets: [set(110, 3)] },
      { startedAt: monday, sets: [set(100, 10)] },
    ]);

    expect(records.weight).toEqual({ value: 110, date: friday });
    expect(records.volume).toEqual({ value: 1000, date: monday });
    expect(records.oneRepMax?.date).toEqual(monday);
  });

  test("gives the earlier date for a tie", () => {
    const records = summarizePersonalRecords([
      { startedAt: friday, sets: [set(100, 5)] },
      { startedAt: monday, sets: [set(100, 5)] },
    ]);

    expect(records.weight?.date).toEqual(monday);
  });

  test("returns null without a weighted set", () => {
    const records = summarizePersonalRecords([
      { startedAt: monday, sets: [set(null, 20)] },
    ]);

    expect(records).toEqual({ weight: null, volume: null, oneRepMax: null });
  });
});
