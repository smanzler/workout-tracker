import { Model } from "@nozbe/watermelondb";
import {
  date,
  field,
  nochange,
  readonly,
  text,
} from "@nozbe/watermelondb/decorators";

export default class Exercise extends Model {
  static table = "exercises";

  @text("title") title: any;
  @text("description") description: any;
  @text("image") image: any;
  @text("category") dueAt: any;

  @nochange @field("user_id") userId: any;

  @readonly @date("created_at") createdAt: any;
  @readonly @date("updated_at") updatedAt: any;
}
