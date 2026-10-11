import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { markPersonalRecords } from "@rep/shared";
import type { Transaction } from "../db";
import { WorkoutExercises, WorkoutSets, Workouts } from "../db/schema";

// Postgres allows 65535 bind parameters, and each row takes 4.
const UPDATE_CHUNK_SIZE = 10_000;

const listSets = (
  tx: Transaction,
  { userId, exerciseIds }: { userId: string; exerciseIds: string[] },
) =>
  tx
    .select({
      id: WorkoutSets.id,
      weight: WorkoutSets.weight,
      reps: WorkoutSets.reps,
      isWeightPr: WorkoutSets.isWeightPr,
      isVolumePr: WorkoutSets.isVolumePr,
      isOneRepMaxPr: WorkoutSets.isOneRepMaxPr,
      workoutExerciseId: WorkoutSets.workoutExerciseId,
      exerciseId: WorkoutExercises.exerciseId,
    })
    .from(WorkoutSets)
    .innerJoin(
      WorkoutExercises,
      eq(WorkoutExercises.id, WorkoutSets.workoutExerciseId),
    )
    .innerJoin(Workouts, eq(Workouts.id, WorkoutExercises.workoutId))
    .where(
      and(
        eq(Workouts.userId, userId),
        inArray(WorkoutExercises.exerciseId, exerciseIds),
      ),
    )
    .orderBy(
      asc(Workouts.startedAt),
      asc(WorkoutExercises.position),
      asc(WorkoutSets.position),
    );

type StoredSet = Awaited<ReturnType<typeof listSets>>[number];

const hasNewFlags = ({
  stored,
  marked,
}: {
  stored: StoredSet;
  marked: Pick<StoredSet, "isWeightPr" | "isVolumePr" | "isOneRepMaxPr">;
}) =>
  stored.isWeightPr !== marked.isWeightPr ||
  stored.isVolumePr !== marked.isVolumePr ||
  stored.isOneRepMaxPr !== marked.isOneRepMaxPr;

/**
 * Recomputes the PR flags of every set of the given exercises for one user.
 * Call it in the transaction that adds, changes or removes their sets.
 */
export const updatePersonalRecords = async (
  tx: Transaction,
  { userId, exerciseIds }: { userId: string; exerciseIds: string[] },
) => {
  if (exerciseIds.length === 0) return;

  const sets = await listSets(tx, { userId, exerciseIds });
  const byExercise = Map.groupBy(sets, (set) => set.exerciseId);

  const changed = [...byExercise.values()].flatMap((exerciseSets) => {
    const entries = [
      ...Map.groupBy(exerciseSets, (set) => set.workoutExerciseId).values(),
    ];

    return markPersonalRecords(
      entries.map((entry) => entry.map((stored) => ({ ...stored, stored }))),
    )
      .flat()
      .filter((marked) => hasNewFlags({ stored: marked.stored, marked }));
  });

  for (let iArray = 0; iArray < changed.length; iArray += UPDATE_CHUNK_SIZE) {
    const rows = changed
      .slice(iArray, iArray + UPDATE_CHUNK_SIZE)
      .map(
        (set) =>
          sql`(${set.id}::uuid, ${set.isWeightPr}::boolean, ${set.isVolumePr}::boolean, ${set.isOneRepMaxPr}::boolean)`,
      );

    await tx.execute(sql`
      update ${WorkoutSets} set
        is_weight_pr = v.is_weight_pr,
        is_volume_pr = v.is_volume_pr,
        is_one_rep_max_pr = v.is_one_rep_max_pr
      from (values ${sql.join(rows, sql`, `)}) as v(id, is_weight_pr, is_volume_pr, is_one_rep_max_pr)
      where ${WorkoutSets.id} = v.id
    `);
  }
};
