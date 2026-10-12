import { toChartPoints } from "./chart";

describe("toChartPoints", () => {
  it("gives the best set of the last entries in time order", () => {
    const entries = [
      {
        startedAt: new Date(3_000),
        sets: [
          { weight: 100, reps: 5 },
          { weight: 120, reps: 3 },
        ],
      },
      { startedAt: new Date(1_000), sets: [{ weight: 90, reps: 8 }] },
      { startedAt: new Date(2_000), sets: [{ weight: null, reps: 10 }] },
      { startedAt: new Date(4_000), sets: [] },
    ];

    expect(
      toChartPoints(entries, 3).map(({ bestSet, value }) => ({
        bestSet,
        value,
      })),
    ).toEqual([
      { bestSet: { weight: null, reps: 10 }, value: 0 },
      { bestSet: { weight: 120, reps: 3 }, value: 120 },
    ]);
  });
});
