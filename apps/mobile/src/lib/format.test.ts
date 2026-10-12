import { findBestSet, formatCount, formatSet, formatWeight } from "./format";

describe("formatSet", () => {
  it("shows weight and reps", () => {
    expect(formatSet({ weight: 135, reps: 8 })).toBe("135 lb × 8");
  });

  it("shows only reps without a weight", () => {
    expect(formatSet({ weight: null, reps: 12 })).toBe("× 12");
  });

  it("shows a dash when empty", () => {
    expect(formatSet({ weight: null, reps: null })).toBe("—");
  });
});

describe("formatWeight", () => {
  it("groups the thousands", () => {
    expect(formatWeight(2160)).toBe("2,160 lb");
  });
});

describe("findBestSet", () => {
  it("picks the heaviest set, then the one with more reps", () => {
    const sets = [
      { weight: 100, reps: 10 },
      { weight: 120, reps: 3 },
      { weight: 120, reps: 5 },
    ];

    expect(findBestSet(sets)).toBe(sets[2]);
  });

  it("returns undefined for no sets", () => {
    expect(findBestSet([])).toBeUndefined();
  });
});

describe("formatCount", () => {
  it("adds an S to every count but one", () => {
    expect(formatCount(1, "PR")).toBe("1 PR");
    expect(formatCount(0, "PR")).toBe("0 PRS");
  });
});
