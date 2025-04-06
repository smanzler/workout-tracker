import { Model } from "@nozbe/watermelondb";
import {
  field,
  date,
  relation,
  nochange,
} from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { RoutineExercise } from "./RoutineExercise";

export class RoutineSet extends Model {
  static table = "routine_sets";
  static associations: Associations = {
    routine_exercises: { type: "belongs_to", key: "routine_exercise_id" },
  };

  @relation("routine_exercises", "routine_exercise_id")
  routineExercise!: RoutineExercise;

  @field("reps") reps?: number;
  @field("weight") weight?: number;

  @field("user_id") userId?: string;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
