import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import schema from "./schema";
import { setGenerator } from "@nozbe/watermelondb/utils/common/randomId";
import * as Crypto from "expo-crypto";
import { Exercise } from "@/models/Exercise";
import { Set } from "@/models/Set";
import { Superset } from "@/models/Superset";
import { Workout } from "@/models/Workout";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Template } from "@/models/Template";
import { TemplateExercise } from "@/models/TemplateExercise";

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
    Set,
    Superset,
    Template,
    TemplateExercise,
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
