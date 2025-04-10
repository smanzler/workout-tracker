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

  @field("reps") reps?: number;
  @field("weight") weight?: number;
  @field("completed") completed!: boolean;

  @field("is_volume_pr") isVolumePr!: boolean;
  @field("is_1rm_pr") is1RMPr!: boolean;
  @field("is_weight_pr") isWeightPr!: boolean;

  @field("user_id") userId?: string;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
