import { metricValues, type SetPerformance } from "@rep/shared";

export const sumVolume = (sets: SetPerformance[]) =>
  sets.reduce((total, set) => total + metricValues.volume(set), 0);
