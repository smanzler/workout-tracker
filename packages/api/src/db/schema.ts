import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { exerciseCategories, muscleGroups } from "@rep/shared";
import { users } from "./auth-schema";

export const Profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    username: text("username").notNull(),
    avatarKey: text("avatar_key"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("profiles_username_lower_idx").on(sql`lower(${t.username})`),
  ],
);

export const exerciseCategoryEnum = pgEnum(
  "exercise_category",
  exerciseCategories,
);
export const muscleGroupEnum = pgEnum("muscle_group", muscleGroups);

// A null userId marks a built-in exercise that every user sees.
export const Exercises = pgTable(
  "exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    category: exerciseCategoryEnum("category"),
    muscleGroup: muscleGroupEnum("muscle_group"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("exercises_user_id_idx").on(t.userId)],
);

export const Workouts = pgTable(
  "workouts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startedAt: timestamp("started_at").notNull(),
    endedAt: timestamp("ended_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("workouts_user_id_started_at_idx").on(t.userId, t.startedAt)],
);

export const WorkoutExercises = pgTable(
  "workout_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => Workouts.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => Exercises.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    notes: text("notes"),
  },
  (t) => [
    index("workout_exercises_workout_id_idx").on(t.workoutId),
    index("workout_exercises_exercise_id_idx").on(t.exerciseId),
  ],
);

export const WorkoutSets = pgTable(
  "workout_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workoutExerciseId: uuid("workout_exercise_id")
      .notNull()
      .references(() => WorkoutExercises.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    weight: numeric("weight", { mode: "number" }),
    reps: integer("reps"),
    isWeightPr: boolean("is_weight_pr").notNull().default(false),
    isVolumePr: boolean("is_volume_pr").notNull().default(false),
    isOneRepMaxPr: boolean("is_one_rep_max_pr").notNull().default(false),
  },
  (t) => [
    index("workout_sets_workout_exercise_id_idx").on(t.workoutExerciseId),
  ],
);

export const Routines = pgTable(
  "routines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("routines_user_id_idx").on(t.userId)],
);

export const RoutineExercises = pgTable(
  "routine_exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    routineId: uuid("routine_id")
      .notNull()
      .references(() => Routines.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => Exercises.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
  },
  (t) => [index("routine_exercises_routine_id_idx").on(t.routineId)],
);

export const RoutineSets = pgTable(
  "routine_sets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    routineExerciseId: uuid("routine_exercise_id")
      .notNull()
      .references(() => RoutineExercises.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    weight: numeric("weight", { mode: "number" }),
    reps: integer("reps"),
  },
  (t) => [
    index("routine_sets_routine_exercise_id_idx").on(t.routineExerciseId),
  ],
);

export * from "./auth-schema";
