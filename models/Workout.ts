import { Model } from "@nozbe/watermelondb";
import { field, date } from "@nozbe/watermelondb/decorators";

export class Workout extends Model {
  static table = "workouts";

  @field("name") name!: string;
  @field("date") date!: number;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
