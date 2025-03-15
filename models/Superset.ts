import { Model } from "@nozbe/watermelondb";
import { field, date, relation } from "@nozbe/watermelondb/decorators";
import { Workout } from "./Workout";

export class Superset extends Model {
  static table = "supersets";

  @relation("workouts", "workout_id") workout!: Workout;
  @field("order") order!: number;

  @field("user_id") userId!: string | undefined;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
