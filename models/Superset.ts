import { Model } from "@nozbe/watermelondb";
import { field, date, relation } from "@nozbe/watermelondb/decorators";
import { Workout } from "./Workout";
import { Associations } from "@nozbe/watermelondb/Model";

export class Superset extends Model {
  static table = "supersets";
  static associations: Associations = {
    workouts: { type: "belongs_to", key: "workout_id" },
  };

  @relation("workouts", "workout_id") workout!: Workout;
  @field("order") order!: number;

  @field("user_id") userId?: string;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
