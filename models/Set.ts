import { Model } from "@nozbe/watermelondb";
import {
  field,
  date,
  relation,
  nochange,
} from "@nozbe/watermelondb/decorators";
import { WorkoutExercise } from "./WorkoutExercise";

export class Set extends Model {
  static table = "sets";

  @relation("workout_exercises", "workout_exercise_id")
  workoutExercise!: WorkoutExercise;

  @field("reps") reps!: number;
  @field("weight") weight!: number;

  @field("user_id") userId!: string | undefined;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
