import { z } from "zod";

export const workoutSetInputSchema = z.object({
  weight: z.number().nonnegative().nullable(),
  reps: z.number().int().nonnegative().nullable(),
});

export type WorkoutSetInput = z.infer<typeof workoutSetInputSchema>;

export const workoutExerciseInputSchema = z.object({
  exerciseId: z.uuid(),
  notes: z.string().trim().max(1000).optional(),
  sets: z.array(workoutSetInputSchema).min(1),
});

export type WorkoutExerciseInput = z.infer<typeof workoutExerciseInputSchema>;

export const workoutNameSchema = z.string().trim().min(1).max(100);

/** Times are epoch milliseconds. */
export const createWorkoutSchema = z
  .object({
    name: workoutNameSchema,
    startedAt: z.number().int(),
    endedAt: z.number().int(),
    exercises: z.array(workoutExerciseInputSchema).min(1),
  })
  .refine(({ startedAt, endedAt }) => endedAt >= startedAt, {
    message: "A workout cannot end before it starts",
    path: ["endedAt"],
  });

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export const updateWorkoutSchema = z.object({
  id: z.uuid(),
  name: workoutNameSchema,
  exercises: z.array(workoutExerciseInputSchema).min(1),
});

export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
