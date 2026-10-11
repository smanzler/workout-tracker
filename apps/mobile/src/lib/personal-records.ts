import type { PersonalRecordFlags } from "@rep/shared";

export const isPersonalRecord = ({
  isWeightPr,
  isVolumePr,
  isOneRepMaxPr,
}: PersonalRecordFlags) => isWeightPr || isVolumePr || isOneRepMaxPr;

/** Counts each record that a set broke, so one set can count up to three. */
export const countPersonalRecords = (sets: PersonalRecordFlags[]) =>
  sets.reduce(
    (count, { isWeightPr, isVolumePr, isOneRepMaxPr }) =>
      count + Number(isWeightPr) + Number(isVolumePr) + Number(isOneRepMaxPr),
    0,
  );
