import { findNearestIndex, layoutPoints, toChartPoints } from "./chart";

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

describe("layoutPoints", () => {
  it("spaces the points evenly and puts the highest value at the top", () => {
    expect(
      layoutPoints([100, 150, 125], { width: 120, height: 70, inset: 10 }),
    ).toEqual([
      { x: 10, y: 60 },
      { x: 60, y: 10 },
      { x: 110, y: 35 },
    ]);
  });

  it("centers equal values and a single point", () => {
    expect(layoutPoints([50], { width: 120, height: 70, inset: 10 })).toEqual([
      { x: 60, y: 35 },
    ]);
  });
});

describe("findNearestIndex", () => {
  const layout = { count: 3, width: 120, inset: 10 };

  it("finds the nearest point and stays in range", () => {
    expect(findNearestIndex(40, layout)).toBe(1);
    expect(findNearestIndex(-30, layout)).toBe(0);
    expect(findNearestIndex(500, layout)).toBe(2);
  });
});
