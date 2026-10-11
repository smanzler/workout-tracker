import type { ExerciseCategory, MuscleGroup } from "@rep/shared";

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  chest: "Chest",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  back: "Back",
  core: "Core",
  cardio: "Cardio",
};

export const exerciseCategoryLabels: Record<ExerciseCategory, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  machine: "Machine",
  bodyweight: "Bodyweight",
  assisted_bodyweight: "Assisted Bodyweight",
  reps_only: "Reps Only",
  duration: "Duration",
};
