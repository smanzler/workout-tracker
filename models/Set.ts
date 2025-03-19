import { Model } from "@nozbe/watermelondb";
import {
  field,
  date,
  relation,
  nochange,
} from "@nozbe/watermelondb/decorators";
import { WorkoutExercise } from "./WorkoutExercise";
import { Associations } from "@nozbe/watermelondb/Model";

export class Set extends Model {
  static table = "sets";
  static associations: Associations = {
    workout_exercises: { type: "belongs_to", key: "workout_exercise_id" },
  };

  @relation("workout_exercises", "workout_exercise_id")
  workoutExercise!: WorkoutExercise;

  @field("reps") reps!: number;
  @field("weight") weight!: number;
  @field("order") order!: number;

  @field("user_id") userId?: string;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
