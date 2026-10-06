import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  Workouts: {
    exercises: r.many.WorkoutExercises({
      from: r.Workouts.id,
      to: r.WorkoutExercises.workoutId,
    }),
  },
  WorkoutExercises: {
    workout: r.one.Workouts({
      from: r.WorkoutExercises.workoutId,
      to: r.Workouts.id,
    }),
    exercise: r.one.Exercises({
      from: r.WorkoutExercises.exerciseId,
      to: r.Exercises.id,
    }),
    sets: r.many.WorkoutSets({
      from: r.WorkoutExercises.id,
      to: r.WorkoutSets.workoutExerciseId,
    }),
  },
  WorkoutSets: {
    workoutExercise: r.one.WorkoutExercises({
      from: r.WorkoutSets.workoutExerciseId,
      to: r.WorkoutExercises.id,
    }),
  },
  Routines: {
    exercises: r.many.RoutineExercises({
      from: r.Routines.id,
      to: r.RoutineExercises.routineId,
    }),
  },
  RoutineExercises: {
    routine: r.one.Routines({
      from: r.RoutineExercises.routineId,
      to: r.Routines.id,
    }),
    exercise: r.one.Exercises({
      from: r.RoutineExercises.exerciseId,
      to: r.Exercises.id,
    }),
    sets: r.many.RoutineSets({
      from: r.RoutineExercises.id,
      to: r.RoutineSets.routineExerciseId,
    }),
  },
  RoutineSets: {
    routineExercise: r.one.RoutineExercises({
      from: r.RoutineSets.routineExerciseId,
      to: r.RoutineExercises.id,
    }),
  },
}));
