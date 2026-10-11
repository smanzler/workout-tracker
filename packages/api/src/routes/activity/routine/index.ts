import db from "../../../db/index";
import { RoutineExercises, RoutineSets, Routines } from "../../../db/schema";
import { createRoutineSchema } from "@rep/shared";
import { and, eq } from "drizzle-orm";
import { hasExerciseAccess } from "../../../lib/exercises";
import { protectedProcedure, router } from "../../../lib/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const findRoutines = ({ userId, id }: { userId: string; id?: string }) =>
  db.query.Routines.findMany({
    where: { userId, ...(id && { id }) },
    orderBy: { createdAt: "desc" },
    columns: { id: true, name: true, createdAt: true },
    with: {
      exercises: {
        orderBy: { position: "asc" },
        columns: { id: true, exerciseId: true },
        with: {
          exercise: {
            columns: { title: true, category: true, muscleGroup: true },
          },
          sets: {
            orderBy: { position: "asc" },
            columns: { id: true, weight: true, reps: true },
          },
        },
      },
    },
  });

export const routineRouter = router({
  getAll: protectedProcedure.query(async (opts) => {
    const { user } = opts.ctx;

    return findRoutines({ userId: user.id });
  }),

  get: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async (opts) => {
      const { user } = opts.ctx;
      const { id } = opts.input;

      const [routine] = await findRoutines({ userId: user.id, id });

      if (!routine) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return routine;
    }),

  create: protectedProcedure
    .input(createRoutineSchema)
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { name, exercises } = opts.input;

      const exerciseIds = exercises.map(({ exerciseId }) => exerciseId);

      const routineId = await db.transaction(async (tx) => {
        if (!(await hasExerciseAccess(tx, { userId: user.id, exerciseIds }))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Unknown exercise",
          });
        }

        const [routine] = await tx
          .insert(Routines)
          .values({ userId: user.id, name })
          .returning({ id: Routines.id });

        if (!routine) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error saving routine",
          });
        }

        const rows = exercises.map((exercise, position) => ({
          ...exercise,
          id: crypto.randomUUID(),
          position,
        }));

        await tx.insert(RoutineExercises).values(
          rows.map(({ id, exerciseId, position }) => ({
            id,
            routineId: routine.id,
            exerciseId,
            position,
          })),
        );

        await tx.insert(RoutineSets).values(
          rows.flatMap(({ id, sets }) =>
            sets.map(({ weight, reps }, position) => ({
              routineExerciseId: id,
              position,
              weight,
              reps,
            })),
          ),
        );

        return routine.id;
      });

      return { routineId };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { id } = opts.input;

      const [routine] = await db
        .delete(Routines)
        .where(and(eq(Routines.id, id), eq(Routines.userId, user.id)))
        .returning({ id: Routines.id });

      if (!routine) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return { routineId: id };
    }),
});
