import db from "../../../db/index";
import {
  Exercises,
  WorkoutExercises,
  WorkoutSets,
  Workouts,
} from "../../../db/schema";
import { createExerciseSchema, summarizePersonalRecords } from "@rep/shared";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { isVisibleTo } from "../../../lib/exercises";
import { protectedProcedure, router } from "../../../lib/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const exerciseColumns = {
  id: Exercises.id,
  title: Exercises.title,
  category: Exercises.category,
  muscleGroup: Exercises.muscleGroup,
};

export const exerciseRouter = router({
  getAll: protectedProcedure.query(async (opts) => {
    const { user } = opts.ctx;

    const exercises = await db
      .select(exerciseColumns)
      .from(Exercises)
      .where(isVisibleTo(user.id))
      .orderBy(asc(sql`lower(${Exercises.title})`));

    // One heaviest set per exercise, by weight, then reps.
    const bestSets = await db
      .selectDistinctOn([WorkoutExercises.exerciseId], {
        exerciseId: WorkoutExercises.exerciseId,
        weight: WorkoutSets.weight,
        reps: WorkoutSets.reps,
      })
      .from(WorkoutSets)
      .innerJoin(
        WorkoutExercises,
        eq(WorkoutExercises.id, WorkoutSets.workoutExerciseId),
      )
      .innerJoin(Workouts, eq(Workouts.id, WorkoutExercises.workoutId))
      .where(eq(Workouts.userId, user.id))
      .orderBy(
        WorkoutExercises.exerciseId,
        sql`${WorkoutSets.weight} desc nulls last`,
        sql`${WorkoutSets.reps} desc nulls last`,
      );

    const bestSetByExercise = new Map(
      bestSets.map(({ exerciseId, weight, reps }) => [
        exerciseId,
        { weight, reps },
      ]),
    );

    return exercises.map((exercise) => ({
      ...exercise,
      bestSet: bestSetByExercise.get(exercise.id) ?? null,
    }));
  }),

  create: protectedProcedure
    .input(createExerciseSchema)
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { title, category, muscleGroup } = opts.input;

      const [existing] = await db
        .select({ id: Exercises.id })
        .from(Exercises)
        .where(
          and(
            isVisibleTo(user.id),
            sql`lower(${Exercises.title}) = lower(${title})`,
          ),
        )
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An exercise with this name already exists",
        });
      }

      const [exercise] = await db
        .insert(Exercises)
        .values({ userId: user.id, title, category, muscleGroup })
        .returning(exerciseColumns);

      if (!exercise) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating exercise",
        });
      }

      return { ...exercise, bestSet: null };
    }),

  history: protectedProcedure
    .input(z.object({ exerciseId: z.uuid() }))
    .query(async (opts) => {
      const { user } = opts.ctx;
      const { exerciseId } = opts.input;

      const [exercise] = await db
        .select(exerciseColumns)
        .from(Exercises)
        .where(and(eq(Exercises.id, exerciseId), isVisibleTo(user.id)));

      if (!exercise) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const workouts = await db.query.Workouts.findMany({
        where: { userId: user.id, exercises: { exerciseId } },
        orderBy: { startedAt: "desc" },
        columns: { id: true, name: true, startedAt: true },
        with: {
          exercises: {
            where: { exerciseId },
            orderBy: { position: "asc" },
            columns: { id: true },
            with: {
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

      const entries = workouts.flatMap((workout) =>
        workout.exercises.map(({ id, sets }) => ({
          id,
          workoutId: workout.id,
          workoutName: workout.name,
          startedAt: workout.startedAt,
          sets,
        })),
      );

      return {
        exercise,
        entries,
        records: summarizePersonalRecords(entries),
      };
    }),

  previousSets: protectedProcedure
    .input(z.object({ exerciseId: z.uuid() }))
    .query(async (opts) => {
      const { user } = opts.ctx;
      const { exerciseId } = opts.input;

      const [latest] = await db
        .select({ id: WorkoutExercises.id })
        .from(WorkoutExercises)
        .innerJoin(Workouts, eq(Workouts.id, WorkoutExercises.workoutId))
        .where(
          and(
            eq(Workouts.userId, user.id),
            eq(WorkoutExercises.exerciseId, exerciseId),
          ),
        )
        .orderBy(desc(Workouts.startedAt), asc(WorkoutExercises.position))
        .limit(1);

      if (!latest) return [];

      return db
        .select({ weight: WorkoutSets.weight, reps: WorkoutSets.reps })
        .from(WorkoutSets)
        .where(eq(WorkoutSets.workoutExerciseId, latest.id))
        .orderBy(asc(WorkoutSets.position));
    }),
});
