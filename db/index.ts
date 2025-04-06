import { Database, Q } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import schema from "./schema";
import { setGenerator } from "@nozbe/watermelondb/utils/common/randomId";
import * as Crypto from "expo-crypto";
import { Exercise } from "@/models/Exercise";
import { Set } from "@/models/Set";
import { Superset } from "@/models/Superset";
import { Workout } from "@/models/Workout";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Routine } from "@/models/Routine";
import { RoutineExercise } from "@/models/RoutineExercise";
import { RoutineSet } from "@/models/RoutineSets";

const adapter = new SQLiteAdapter({
  schema,
  // migrations,
  jsi: true,
  onSetUpError: (error) => {
    console.log(error);
  },
});

const database = new Database({
  adapter,
  modelClasses: [
    Exercise,
    Routine,
    RoutineExercise,
    RoutineSet,
    Set,
    Superset,
    Workout,
    WorkoutExercise,
  ],
});

setGenerator(() => Crypto.randomUUID());

export default database;

export const exercisesCollection = database.get<Exercise>("exercises");
export const workoutsCollection = database.get<Workout>("workouts");
export const workoutExercisesCollection =
  database.get<WorkoutExercise>("workout_exercises");
export const setsCollection = database.get<Set>("sets");
export const routinesCollection = database.get<Routine>("routines");
export const routineExercisesCollection =
  database.get<RoutineExercise>("routine_exercises");
export const routineSetsCollection = database.get<RoutineSet>("routine_sets");

export const migrateUserData = async (userId: string) => {
  try {
    await database.write(async () => {
      const workoutsToUpdate = await workoutsCollection
        .query(Q.where("user_id", null))
        .fetch();
      const workoutUpdates = workoutsToUpdate.map((w) =>
        w.prepareUpdate((rec) => {
          rec.userId = userId;
        })
      );

      const setsToUpdate = await setsCollection
        .query(Q.where("user_id", null))
        .fetch();
      const setUpdates = setsToUpdate.map((s) =>
        s.prepareUpdate((rec) => {
          rec.userId = userId;
        })
      );

      const workoutExercisesToUpdate = await workoutExercisesCollection
        .query(Q.where("user_id", null))
        .fetch();
      const workoutExerciseUpdates = workoutExercisesToUpdate.map((we) =>
        we.prepareUpdate((rec) => {
          rec.userId = userId;
        })
      );

      const exercisesToUpdate = await exercisesCollection
        .query(Q.where("user_id", null), Q.where("is_default", false))
        .fetch();
      const exerciseUpdates = exercisesToUpdate.map((e) =>
        e.prepareUpdate((rec) => {
          rec.userId = userId;
        })
      );

      const allUpdates = [
        ...workoutUpdates,
        ...setUpdates,
        ...workoutExerciseUpdates,
        ...exerciseUpdates,
      ];

      if (allUpdates.length > 0) {
        await database.batch(...allUpdates);
        console.log(`Migrated ${allUpdates.length} records`);
      } else {
        console.log("No records needed migration");
      }
    });
  } catch (error) {
    console.error("Error migrating user data:", error);
  }
};
