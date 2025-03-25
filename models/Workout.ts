import { Model, Query } from "@nozbe/watermelondb";
import { field, date, children } from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { WorkoutExercise } from "./WorkoutExercise";

export class Workout extends Model {
  static table = "workouts";
  static associations: Associations = {
    workout_exercises: { type: "has_many", foreignKey: "workout_id" },
  };

  @field("name") name!: string;
  @date("start_time") startTime!: number;
  @date("end_time") endTime?: number;

  @children("workout_exercises") workoutExercises!: Query<WorkoutExercise>;

  @field("user_id") userId?: string;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
