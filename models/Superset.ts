import { Model } from "@nozbe/watermelondb";
import { field, date, relation } from "@nozbe/watermelondb/decorators";

export class Superset extends Model {
  static table = "supersets";

  @relation("workouts", "workout_id") workout!: Workout;
  @field("order") order!: number;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
