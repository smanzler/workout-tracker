import { and, eq, inArray, isNull, or } from "drizzle-orm";
import type { Transaction } from "../db";
import { Exercises } from "../db/schema";

/** Whether every exercise is built-in or belongs to the user. */
export const hasExerciseAccess = async (
  tx: Transaction,
  { userId, exerciseIds }: { userId: string; exerciseIds: string[] },
) => {
  const uniqueIds = [...new Set(exerciseIds)];

  const visible = await tx
    .select({ id: Exercises.id })
    .from(Exercises)
    .where(
      and(
        inArray(Exercises.id, uniqueIds),
        or(isNull(Exercises.userId), eq(Exercises.userId, userId)),
      ),
    );

  return visible.length === uniqueIds.length;
};
