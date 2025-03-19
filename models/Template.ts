import { Model, Query } from "@nozbe/watermelondb";
import { field, date, children } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";

export class Template extends Model {
  static table = "templates";
  static associations: Associations = {
    template_exercises: { type: "has_many", foreignKey: "workout_id" },
  };

  @field("name") name!: string;

  @children("template_exercises") templateExercises!: Query<Template>;

  @field("user_id") userId?: string;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
