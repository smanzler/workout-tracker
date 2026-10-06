import { formatDate, formatTime } from "./date";

const now = new Date(2026, 9, 5, 18, 0);

describe("formatDate", () => {
  it("names the last two days", () => {
    expect(formatDate(new Date(2026, 9, 5, 7, 0), now)).toBe("Today");
    expect(formatDate(new Date(2026, 9, 4, 23, 0), now)).toBe("Yesterday");
  });

  it("counts days in the last week", () => {
    expect(formatDate(new Date(2026, 9, 1), now)).toBe("4 days ago");
  });

  it("shows the date after a week, with the year when it differs", () => {
    expect(formatDate(new Date(2026, 8, 20), now)).toBe("Sep 20");
    expect(formatDate(new Date(2025, 8, 20), now)).toBe("Sep 20, 2025");
  });
});

describe("formatTime", () => {
  it("shows hours and minutes in 12-hour time", () => {
    expect(formatTime(new Date(2026, 9, 5, 18, 5))).toMatch(/^6:05\sPM$/);
    expect(formatTime(new Date(2026, 9, 5, 0, 30))).toMatch(/^12:30\sAM$/);
  });
});
