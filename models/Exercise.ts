import { Model } from "@nozbe/watermelondb";
import {
  date,
  field,
  nochange,
  readonly,
  text,
} from "@nozbe/watermelondb/decorators";

export class Exercise extends Model {
  static table = "exercises";

  @text("title") title!: string;
  @text("description") description?: string;
  @text("category") category?: string;
  @text("muscle_group") muscle_group?: string;
  @text("image") image?: string;

  @field("user_id") userId?: string;

  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
}
