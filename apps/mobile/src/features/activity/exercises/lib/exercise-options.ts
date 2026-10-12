import type { ExerciseCategory, MuscleGroup } from "@rep/shared";
import { exerciseCategoryLabels, muscleGroupLabels } from "../../lib/labels";

export type ExerciseOptions = {
  muscleGroup: MuscleGroup | null;
  category: ExerciseCategory | null;
};

export type ExerciseOption = keyof ExerciseOptions;

type OptionDispatch<K extends ExerciseOption = ExerciseOption> = {
  title: string;
  labels: Record<NonNullable<ExerciseOptions[K]>, string>;
};

export const exerciseOptions: { [K in ExerciseOption]: OptionDispatch<K> } = {
  muscleGroup: { title: "Muscle Group", labels: muscleGroupLabels },
  category: { title: "Category", labels: exerciseCategoryLabels },
};

/** The title, labels and value of `option`, keyed by plain strings. */
export const describeOption = (
  option: ExerciseOption,
  options: ExerciseOptions,
) => {
  const { title, labels } = exerciseOptions[option];
  return {
    title,
    labels: labels as Record<string, string>,
    value: options[option] as string | null,
  };
};
