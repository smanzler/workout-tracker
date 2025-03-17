import { Model } from "@nozbe/watermelondb";
import { field, date } from "@nozbe/watermelondb/decorators";

export class Workout extends Model {
  static table = "workouts";

  @field("name") name!: string;
  @date("startTime") startTime!: number;
  @date("endTime") endTime!: number | undefined;

  @field("user_id") userId!: string | undefined;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
