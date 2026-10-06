CREATE TYPE "exercise_category" AS ENUM('barbell', 'dumbbell', 'machine', 'bodyweight', 'assisted_bodyweight', 'reps_only', 'duration');--> statement-breakpoint
CREATE TYPE "muscle_group" AS ENUM('chest', 'shoulders', 'arms', 'legs', 'back', 'core', 'cardio');--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"title" text NOT NULL,
	"category" "exercise_category",
	"muscle_group" "muscle_group",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"routine_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"routine_exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"weight" numeric,
	"reps" integer
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workout_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "workout_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workout_exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"weight" numeric,
	"reps" integer,
	"is_weight_pr" boolean DEFAULT false NOT NULL,
	"is_volume_pr" boolean DEFAULT false NOT NULL,
	"is_one_rep_max_pr" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"started_at" timestamp NOT NULL,
	"ended_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "exercises_user_id_idx" ON "exercises" ("user_id");--> statement-breakpoint
CREATE INDEX "routine_exercises_routine_id_idx" ON "routine_exercises" ("routine_id");--> statement-breakpoint
CREATE INDEX "routine_sets_routine_exercise_id_idx" ON "routine_sets" ("routine_exercise_id");--> statement-breakpoint
CREATE INDEX "routines_user_id_idx" ON "routines" ("user_id");--> statement-breakpoint
CREATE INDEX "workout_exercises_workout_id_idx" ON "workout_exercises" ("workout_id");--> statement-breakpoint
CREATE INDEX "workout_exercises_exercise_id_idx" ON "workout_exercises" ("exercise_id");--> statement-breakpoint
CREATE INDEX "workout_sets_workout_exercise_id_idx" ON "workout_sets" ("workout_exercise_id");--> statement-breakpoint
CREATE INDEX "workouts_user_id_started_at_idx" ON "workouts" ("user_id","started_at");--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_routine_id_routines_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_exercise_id_exercises_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "routine_sets" ADD CONSTRAINT "routine_sets_routine_exercise_id_routine_exercises_id_fkey" FOREIGN KEY ("routine_exercise_id") REFERENCES "routine_exercises"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "routines" ADD CONSTRAINT "routines_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercises_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_workout_exercise_id_workout_exercises_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercises"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;