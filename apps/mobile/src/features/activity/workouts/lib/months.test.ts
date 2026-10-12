import { groupByMonth, toMonthKey } from "./months";

describe("toMonthKey", () => {
  it("pads the month", () => {
    expect(toMonthKey(new Date(2026, 2, 31))).toBe("2026-03");
  });
});

describe("groupByMonth", () => {
  it("keeps the order of the months and of the workouts", () => {
    const workouts = [
      { id: "a", startedAt: new Date(2026, 9, 11) },
      { id: "b", startedAt: new Date(2026, 9, 2) },
      { id: "c", startedAt: new Date(2026, 8, 30) },
    ];

    expect(
      groupByMonth(workouts).map(({ key, data }) => [
        key,
        data.map(({ id }) => id),
      ]),
    ).toEqual([
      ["2026-10", ["a", "b"]],
      ["2026-09", ["c"]],
    ]);
  });
});
