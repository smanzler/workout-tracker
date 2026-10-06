import { and, eq, inArray, isNull, or } from "drizzle-orm";
import type { Transaction } from "../db";
import { Exercises } from "../db/schema";

/** SQL condition for exercises that are built-in or belong to the user. */
export const isVisibleTo = (userId: string) =>
  or(isNull(Exercises.userId), eq(Exercises.userId, userId));

/** Whether every exercise is built-in or belongs to the user. */
export const hasExerciseAccess = async (
  tx: Transaction,
  { userId, exerciseIds }: { userId: string; exerciseIds: string[] },
) => {
  const uniqueIds = [...new Set(exerciseIds)];

  const visible = await tx
    .select({ id: Exercises.id })
    .from(Exercises)
    .where(and(inArray(Exercises.id, uniqueIds), isVisibleTo(userId)));

  return visible.length === uniqueIds.length;
};

const toKey = (title: string) => title.trim().toLowerCase();

/**
 * Maps each title, ignoring case, to a visible exercise, and creates a custom
 * exercise for each title that has none.
 */
export const resolveExerciseTitles = async (
  tx: Transaction,
  { userId, titles }: { userId: string; titles: string[] },
) => {
  const visible = await tx
    .select({ id: Exercises.id, title: Exercises.title })
    .from(Exercises)
    .where(isVisibleTo(userId));

  const idByKey = new Map(visible.map(({ id, title }) => [toKey(title), id]));

  // Reversed so that the first spelling of a title wins.
  const missing = [
    ...new Map(
      titles
        .filter((title) => !idByKey.has(toKey(title)))
        .reverse()
        .map((title) => [toKey(title), title.trim()]),
    ).values(),
  ];

  const created =
    missing.length === 0
      ? []
      : await tx
          .insert(Exercises)
          .values(missing.map((title) => ({ userId, title })))
          .returning({ id: Exercises.id, title: Exercises.title });

  const ids = new Map([
    ...idByKey,
    ...created.map(({ id, title }): [string, string] => [toKey(title), id]),
  ]);

  const getId = (title: string) => {
    const id = ids.get(toKey(title));
    if (!id) throw new Error(`No exercise for "${title}"`);
    return id;
  };

  return { getId, createdCount: created.length };
};
