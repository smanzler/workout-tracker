import type { ExerciseCategory, MuscleGroup } from "@rep/shared";
import { groupBy } from "./group-by";

export type ExerciseFilter = {
  search: string;
  muscleGroup: MuscleGroup | null;
  category: ExerciseCategory | null;
};

type FilterableExercise = {
  title: string;
  muscleGroup: MuscleGroup | null;
  category: ExerciseCategory | null;
};

/**
 * Exercises whose title contains every word of the search, ignoring case, and
 * that have the muscle group and the category when the filter sets them.
 */
export const filterExercises = <TExercise extends FilterableExercise>(
  exercises: TExercise[],
  { search, muscleGroup, category }: ExerciseFilter,
) => {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  return exercises.filter(
    (exercise) =>
      (muscleGroup === null || exercise.muscleGroup === muscleGroup) &&
      (category === null || exercise.category === category) &&
      words.every((word) => exercise.title.toLowerCase().includes(word)),
  );
};

/** Sections for a SectionList, one per first letter, in alphabetical order. */
export const groupByFirstLetter = <TExercise extends { title: string }>(
  exercises: TExercise[],
) => {
  const sorted = [...exercises].sort((a, b) => a.title.localeCompare(b.title));
  const groups = groupBy(sorted, ({ title }) => title.charAt(0).toUpperCase());

  return [...groups].map(([title, data]) => ({ title, data }));
};

const recentDays = 14;
const recentLimit = 8;
const dayInMilliseconds = 24 * 60 * 60 * 1000;

/** Up to 8 exercises done in the last 14 days, the most recent first. */
export const listRecentExercises = <
  TExercise extends { lastPerformedAt: Date | null },
>(
  exercises: TExercise[],
  now: Date,
) =>
  exercises
    .filter(
      ({ lastPerformedAt }) =>
        lastPerformedAt !== null &&
        now.getTime() - lastPerformedAt.getTime() <=
          recentDays * dayInMilliseconds,
    )
    .sort((a, b) => b.lastPerformedAt!.getTime() - a.lastPerformedAt!.getTime())
    .slice(0, recentLimit);

const hasFilter = ({ search, muscleGroup, category }: ExerciseFilter) =>
  search.trim() !== "" || muscleGroup !== null || category !== null;

/**
 * The sections of the exercise list: the recent exercises when nothing
 * filters the list, then one section for each first letter.
 */
export const buildExerciseSections = <
  TExercise extends FilterableExercise & { lastPerformedAt: Date | null },
>(
  exercises: TExercise[],
  filter: ExerciseFilter,
  now: Date,
) => {
  const letters = groupByFirstLetter(filterExercises(exercises, filter)).map(
    (section) => ({ ...section, isRecent: false }),
  );
  const recent = hasFilter(filter) ? [] : listRecentExercises(exercises, now);

  return recent.length > 0
    ? [{ title: "RECENT", data: recent, isRecent: true }, ...letters]
    : letters;
};
