import { formatDuration, formatTimer } from "./duration";

describe("formatTimer", () => {
  it("shows minutes and seconds under an hour", () => {
    expect(formatTimer(0)).toBe("0:00");
    expect(formatTimer(245)).toBe("4:05");
  });

  it("adds hours from an hour on", () => {
    expect(formatTimer(3845)).toBe("1:04:05");
  });
});

describe("formatDuration", () => {
  it("shows minutes under an hour", () => {
    expect(formatDuration(45 * 60_000 + 30_000)).toBe("45m");
  });

  it("shows hours and minutes", () => {
    expect(formatDuration(65 * 60_000)).toBe("1h 5m");
    expect(formatDuration(120 * 60_000)).toBe("2h");
  });
});
