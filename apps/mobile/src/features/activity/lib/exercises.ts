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
