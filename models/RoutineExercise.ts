import { Model } from "@nozbe/watermelondb";
import { field, date, relation } from "@nozbe/watermelondb/decorators";
import { Exercise } from "./Exercise";
import { Superset } from "./Superset";
import { Routine } from "./Routine";
import { Associations } from "@nozbe/watermelondb/Model";

export class RoutineExercise extends Model {
  static table = "routine_exercises";
  static associations: Associations = {
    routines: { type: "belongs_to", key: "workout_id" },
    exercises: { type: "belongs_to", key: "exercise_id" },
    supersets: { type: "belongs_to", key: "superset_id" },
    sets: { type: "has_many", foreignKey: "workout_exercise_id" },
  };

  @relation("routines", "routine_id") routine!: Routine;
  @relation("exercises", "exercise_id") exercise!: Exercise;
  @relation("supersets", "superset_id") superset?: Superset;

  @field("order") order!: number;
  @field("user_id") userId?: string;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
