import { Model } from "@nozbe/watermelondb";
import { field, date, relation } from "@nozbe/watermelondb/decorators";
import { Exercise } from "./Exercise";
import { Superset } from "./Superset";
import { Template } from "./Template";
import { Associations } from "@nozbe/watermelondb/Model";

export class TemplateExercise extends Model {
  static table = "template_exercises";
  static associations: Associations = {
    templates: { type: "belongs_to", key: "workout_id" },
    exercises: { type: "belongs_to", key: "exercise_id" },
    supersets: { type: "belongs_to", key: "superset_id" },
    sets: { type: "has_many", foreignKey: "workout_exercise_id" },
  };

  @relation("templates", "template_id") template!: Template;
  @relation("exercises", "exercise_id") exercise!: Exercise;
  @relation("supersets", "superset_id") superset?: Superset;

  @field("order") order!: number;
  @field("user_id") userId?: string;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
