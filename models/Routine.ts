import { Model, Query } from "@nozbe/watermelondb";
import { field, date, children } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";

export class Routine extends Model {
  static table = "routines";
  static associations: Associations = {
    routine_exercises: { type: "has_many", foreignKey: "workout_id" },
  };

  @field("name") name!: string;

  @children("routine_exercises") routineExercises!: Query<Routine>;

  @field("user_id") userId?: string;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
