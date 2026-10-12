import { countWeekStreak, listWeeks, toDayKey } from "./activity";

const now = new Date(2026, 9, 11);

describe("toDayKey", () => {
  it("pads the month and the day", () => {
    expect(toDayKey(new Date(2026, 2, 4))).toBe("2026-03-04");
  });
});

describe("listWeeks", () => {
  it("ends with the week of today, from Monday to Sunday", () => {
    const weeks = listWeeks(now, 2);

    expect(weeks.map((week) => week.map(toDayKey))).toEqual([
      [
        "2026-09-28",
        "2026-09-29",
        "2026-09-30",
        "2026-10-01",
        "2026-10-02",
        "2026-10-03",
        "2026-10-04",
      ],
      [
        "2026-10-05",
        "2026-10-06",
        "2026-10-07",
        "2026-10-08",
        "2026-10-09",
        "2026-10-10",
        "2026-10-11",
      ],
    ]);
  });
});

describe("countWeekStreak", () => {
  const weeks = listWeeks(now, 4);

  it("counts the weeks in a row up to this week", () => {
    const days = new Set(["2026-09-22", "2026-10-01", "2026-10-06"]);
    expect(countWeekStreak(weeks, days)).toBe(3);
  });

  it("keeps the streak while this week has no workout", () => {
    const days = new Set(["2026-09-22", "2026-10-01"]);
    expect(countWeekStreak(weeks, days)).toBe(2);
  });

  it("stops at a week without a workout", () => {
    const days = new Set(["2026-09-15", "2026-10-01"]);
    expect(countWeekStreak(weeks, days)).toBe(1);
    expect(countWeekStreak(weeks, new Set())).toBe(0);
  });
});
