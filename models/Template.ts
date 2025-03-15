import { Model } from "@nozbe/watermelondb";
import { field, date } from "@nozbe/watermelondb/decorators";

export class Template extends Model {
  static table = "templates";

  @field("name") name!: string;

  @field("user_id") userId!: string | undefined;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
