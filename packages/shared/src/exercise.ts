import { z } from "zod";

export const exerciseCategories = [
  "barbell",
  "dumbbell",
  "machine",
  "bodyweight",
  "assisted_bodyweight",
  "reps_only",
  "duration",
] as const;

export const exerciseCategorySchema = z.enum(exerciseCategories);

export type ExerciseCategory = z.infer<typeof exerciseCategorySchema>;

export const muscleGroups = [
  "chest",
  "shoulders",
  "arms",
  "legs",
  "back",
  "core",
  "cardio",
] as const;

export const muscleGroupSchema = z.enum(muscleGroups);

export type MuscleGroup = z.infer<typeof muscleGroupSchema>;
