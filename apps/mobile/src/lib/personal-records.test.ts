import { countPersonalRecords, isPersonalRecord } from "./personal-records";

const set = (flags: Partial<Parameters<typeof isPersonalRecord>[0]> = {}) => ({
  isWeightPr: false,
  isVolumePr: false,
  isOneRepMaxPr: false,
  ...flags,
});

describe("isPersonalRecord", () => {
  it("is true when the set broke any record", () => {
    expect(isPersonalRecord(set())).toBe(false);
    expect(isPersonalRecord(set({ isVolumePr: true }))).toBe(true);
  });
});

describe("countPersonalRecords", () => {
  it("counts every flag of every set", () => {
    expect(countPersonalRecords([])).toBe(0);
    expect(
      countPersonalRecords([
        set({ isWeightPr: true, isVolumePr: true, isOneRepMaxPr: true }),
        set(),
        set({ isOneRepMaxPr: true }),
      ]),
    ).toBe(4);
  });
});
