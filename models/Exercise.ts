import { Model, Query } from "@nozbe/watermelondb";
import {
  children,
  date,
  field,
  nochange,
  readonly,
  text,
} from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { WorkoutExercise } from "./WorkoutExercise";

export class Exercise extends Model {
  static table = "exercises";
  static associations: Associations = {
    workout_exercises: { type: "has_many", foreignKey: "exercise_id" },
  };

  @text("title") title!: string;
  @text("description") description?: string;
  @text("category") category?: string;
  @text("muscle_group") muscleGroup?: string;
  @text("image") image?: string;

  @field("is_default") isDefault!: boolean;

  @field("user_id") userId?: string;

  @children("workout_exercises") workoutExercises!: Query<WorkoutExercise>;

  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;
}
