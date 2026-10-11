import { z } from "zod";
import { workoutSetInputSchema } from "./workout";

export const createRoutineSchema = z.object({
  name: z.string().trim().min(1).max(100),
  exercises: z
    .array(
      z.object({
        exerciseId: z.uuid(),
        sets: z.array(workoutSetInputSchema).min(1),
      }),
    )
    .min(1),
});

export type CreateRoutineInput = z.infer<typeof createRoutineSchema>;
