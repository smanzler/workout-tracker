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

export const createExerciseSchema = z.object({
  title: z.string().trim().min(1).max(100),
  category: exerciseCategorySchema.nullable(),
  muscleGroup: muscleGroupSchema.nullable(),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
