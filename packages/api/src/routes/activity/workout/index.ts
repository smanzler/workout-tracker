import db, { type Transaction } from "../../../db/index";
import { WorkoutExercises, WorkoutSets, Workouts } from "../../../db/schema";
import {
  createWorkoutSchema,
  importWorkoutsSchema,
  updateWorkoutSchema,
  type WorkoutExerciseInput,
} from "@rep/shared";
import { and, eq, inArray } from "drizzle-orm";
import {
  hasExerciseAccess,
  resolveExerciseTitles,
} from "../../../lib/exercises";
import { updatePersonalRecords } from "../../../lib/personal-records";
import { protectedProcedure, router } from "../../../lib/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const pageSchema = z.object({
  cursor: z.number().int().nonnegative().nullish(),
  limit: z.number().int().min(1).max(50).default(20),
});

const findWorkouts = ({
  userId,
  id,
  limit,
  offset,
}: {
  userId?: string;
  id?: string;
  limit?: number;
  offset?: number;
}) =>
  db.query.Workouts.findMany({
    where: { ...(userId && { userId }), ...(id && { id }) },
    orderBy: { startedAt: "desc", id: "desc" },
    ...(limit !== undefined && { limit }),
    ...(offset !== undefined && { offset }),
    with: {
      exercises: {
        orderBy: { position: "asc" },
        columns: { id: true, exerciseId: true, notes: true },
        with: {
          exercise: {
            columns: { title: true, category: true, muscleGroup: true },
          },
          sets: {
            orderBy: { position: "asc" },
            columns: {
              id: true,
              weight: true,
              reps: true,
              isWeightPr: true,
              isVolumePr: true,
              isOneRepMaxPr: true,
            },
          },
        },
      },
    },
  });

const listPage = async ({
  userId,
  cursor,
  limit,
}: {
  userId: string;
  cursor: number | null | undefined;
  limit: number;
}) => {
  const offset = cursor ?? 0;
  const workouts = await findWorkouts({ userId, limit: limit + 1, offset });

  return {
    items: workouts.slice(0, limit),
    nextCursor: workouts.length > limit ? offset + limit : null,
  };
};

const insertExercises = async (
  tx: Transaction,
  workouts: { workoutId: string; exercises: WorkoutExerciseInput[] }[],
) => {
  const rows = workouts.flatMap(({ workoutId, exercises }) =>
    exercises.map((exercise, position) => ({
      ...exercise,
      id: crypto.randomUUID(),
      workoutId,
      position,
    })),
  );

  await tx.insert(WorkoutExercises).values(
    rows.map(({ id, workoutId, exerciseId, notes, position }) => ({
      id,
      workoutId,
      exerciseId,
      notes: notes ?? null,
      position,
    })),
  );

  await tx.insert(WorkoutSets).values(
    rows.flatMap(({ id, sets }) =>
      sets.map(({ weight, reps }, position) => ({
        workoutExerciseId: id,
        position,
        weight,
        reps,
      })),
    ),
  );
};

const listExerciseIds = async (tx: Transaction, workoutId: string) => {
  const rows = await tx
    .select({ exerciseId: WorkoutExercises.exerciseId })
    .from(WorkoutExercises)
    .where(eq(WorkoutExercises.workoutId, workoutId));

  return rows.map(({ exerciseId }) => exerciseId);
};

const toExerciseIds = (exercises: WorkoutExerciseInput[]) =>
  exercises.map(({ exerciseId }) => exerciseId);

export const workoutRouter = router({
  getAll: protectedProcedure.input(pageSchema).query(async (opts) => {
    const { user } = opts.ctx;
    const { cursor, limit } = opts.input;

    return listPage({ userId: user.id, cursor, limit });
  }),

  getAllByUserId: protectedProcedure
    .input(pageSchema.extend({ userId: z.uuid() }))
    .query(async (opts) => {
      const { userId, cursor, limit } = opts.input;

      return listPage({ userId, cursor, limit });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async (opts) => {
      const { id } = opts.input;

      const [workout] = await findWorkouts({ id });

      if (!workout) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return workout;
    }),

  create: protectedProcedure
    .input(createWorkoutSchema)
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { name, startedAt, endedAt, exercises } = opts.input;

      const exerciseIds = toExerciseIds(exercises);

      const workoutId = await db.transaction(async (tx) => {
        if (!(await hasExerciseAccess(tx, { userId: user.id, exerciseIds }))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unknown exercise",
          });
        }

        const [workout] = await tx
          .insert(Workouts)
          .values({
            userId: user.id,
            name,
            startedAt: new Date(startedAt),
            endedAt: new Date(endedAt),
          })
          .returning({ id: Workouts.id });

        if (!workout) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error saving workout",
          });
        }

        await insertExercises(tx, [{ workoutId: workout.id, exercises }]);
        await updatePersonalRecords(tx, { userId: user.id, exerciseIds });

        return workout.id;
      });

      return { workoutId };
    }),

  update: protectedProcedure
    .input(updateWorkoutSchema)
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { id, name, exercises } = opts.input;

      const exerciseIds = toExerciseIds(exercises);

      await db.transaction(async (tx) => {
        const [workout] = await tx
          .update(Workouts)
          .set({ name })
          .where(and(eq(Workouts.id, id), eq(Workouts.userId, user.id)))
          .returning({ id: Workouts.id });

        if (!workout) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (!(await hasExerciseAccess(tx, { userId: user.id, exerciseIds }))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unknown exercise",
          });
        }

        const previousIds = await listExerciseIds(tx, id);

        // Sets cascade with their exercises.
        await tx
          .delete(WorkoutExercises)
          .where(eq(WorkoutExercises.workoutId, id));
        await insertExercises(tx, [{ workoutId: id, exercises }]);
        await updatePersonalRecords(tx, {
          userId: user.id,
          exerciseIds: [...previousIds, ...exerciseIds],
        });
      });

      return { workoutId: id };
    }),

  import: protectedProcedure
    .input(importWorkoutsSchema)
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { workouts } = opts.input;

      return db.transaction(async (tx) => {
        const existing = await tx
          .select({ name: Workouts.name, startedAt: Workouts.startedAt })
          .from(Workouts)
          .where(
            and(
              eq(Workouts.userId, user.id),
              inArray(
                Workouts.startedAt,
                workouts.map(({ startedAt }) => new Date(startedAt)),
              ),
            ),
          );

        // Importing the same file twice skips the workouts it already added.
        const existingKeys = new Set(
          existing.map(
            ({ name, startedAt }) => `${startedAt.getTime()}:${name}`,
          ),
        );
        const fresh = workouts
          .filter(
            ({ name, startedAt }) => !existingKeys.has(`${startedAt}:${name}`),
          )
          .map((workout) => ({ ...workout, id: crypto.randomUUID() }));

        if (fresh.length === 0) {
          return { importedCount: 0, skippedCount: workouts.length };
        }

        const { getId } = await resolveExerciseTitles(tx, {
          userId: user.id,
          titles: fresh.flatMap(({ exercises }) =>
            exercises.map(({ title }) => title),
          ),
        });

        await tx.insert(Workouts).values(
          fresh.map(({ id, name, startedAt, endedAt }) => ({
            id,
            userId: user.id,
            name,
            startedAt: new Date(startedAt),
            endedAt: new Date(endedAt),
          })),
        );

        const workoutExercises = fresh.map(({ id, exercises }) => ({
          workoutId: id,
          exercises: exercises.map(({ title, notes, sets }) => ({
            exerciseId: getId(title),
            sets,
            ...(notes !== undefined && { notes }),
          })),
        }));

        await insertExercises(tx, workoutExercises);
        await updatePersonalRecords(tx, {
          userId: user.id,
          exerciseIds: workoutExercises.flatMap(({ exercises }) =>
            toExerciseIds(exercises),
          ),
        });

        return {
          importedCount: fresh.length,
          skippedCount: workouts.length - fresh.length,
        };
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { id } = opts.input;

      await db.transaction(async (tx) => {
        const exerciseIds = await listExerciseIds(tx, id);

        const [workout] = await tx
          .delete(Workouts)
          .where(and(eq(Workouts.id, id), eq(Workouts.userId, user.id)))
          .returning({ id: Workouts.id });

        if (!workout) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await updatePersonalRecords(tx, { userId: user.id, exerciseIds });
      });

      return { workoutId: id };
    }),
});
