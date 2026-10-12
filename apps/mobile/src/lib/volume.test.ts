import { sumVolume } from "./volume";

describe("sumVolume", () => {
  it("adds weight × reps, and counts a set without a weight as zero", () => {
    expect(
      sumVolume([
        { weight: 135, reps: 8 },
        { weight: 145, reps: 6 },
        { weight: null, reps: 12 },
      ]),
    ).toBe(1950);
  });

  it("returns zero for no sets", () => {
    expect(sumVolume([])).toBe(0);
  });
});
