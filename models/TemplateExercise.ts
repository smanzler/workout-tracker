import { Model } from "@nozbe/watermelondb";
import { field, date, relation } from "@nozbe/watermelondb/decorators";
import { Exercise } from "./Exercise";
import { Superset } from "./Superset";
import { Template } from "./Template";

export class TemplateExercise extends Model {
  static table = "template_exercises";

  @relation("templates", "template_id") template!: Template;
  @relation("exercises", "exercise_id") exercise!: Exercise;
  @relation("supersets", "superset_id") superset!: Superset | undefined;

  @field("order") order!: number;
  @field("user_id") userId!: string | undefined;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
