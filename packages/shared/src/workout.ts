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

/** The most workouts that one import takes. */
export const maxImportWorkouts = 50;

/** Workouts from another app, with exercises named instead of referenced. */
export const importWorkoutsSchema = z.object({
  workouts: z
    .array(
      z.object({
        name: workoutNameSchema,
        startedAt: z.number().int(),
        endedAt: z.number().int(),
        exercises: z
          .array(
            z.object({
              title: z.string().trim().min(1).max(100),
              notes: z.string().trim().max(1000).optional(),
              sets: z.array(workoutSetInputSchema).min(1),
            }),
          )
          .min(1),
      }),
    )
    .min(1)
    .max(maxImportWorkouts),
});

export type ImportWorkoutsInput = z.infer<typeof importWorkoutsSchema>;

const isTimeZone = (timeZone: string) => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
};

/** An IANA name, such as "America/Chicago". */
const timeZoneSchema = z
  .string()
  .refine(isTimeZone, { message: "Unknown time zone" });

export const monthTotalsInputSchema = z.object({ timeZone: timeZoneSchema });

export type MonthTotalsInput = z.infer<typeof monthTotalsInputSchema>;

/** `from` is epoch milliseconds. */
export const workoutDaysInputSchema = z.object({
  userId: z.uuid(),
  timeZone: timeZoneSchema,
  from: z.number().int(),
});

export type WorkoutDaysInput = z.infer<typeof workoutDaysInputSchema>;
