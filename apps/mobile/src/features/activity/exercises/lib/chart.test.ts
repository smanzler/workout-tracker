import { toWeightPoints } from "./chart";

describe("toWeightPoints", () => {
  it("puts the heaviest weight of each entry in time order", () => {
    const entries = [
      {
        startedAt: new Date(2_000_000),
        sets: [
          { weight: 100, reps: 5 },
          { weight: 120, reps: 3 },
        ],
      },
      { startedAt: new Date(1_000_000), sets: [{ weight: null, reps: 10 }] },
    ];

    expect(toWeightPoints(entries)).toEqual([
      { x: 1000, y: 0 },
      { x: 2000, y: 120 },
    ]);
  });
});
