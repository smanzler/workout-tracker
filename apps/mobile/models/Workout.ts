import { Model, Query } from "@nozbe/watermelondb";
import {
  field,
  date,
  children,
  relation,
} from "@nozbe/watermelondb/decorators";
import { Associations } from "@nozbe/watermelondb/Model";
import { WorkoutExercise } from "./WorkoutExercise";
import { Routine } from "./Routine";

export class Workout extends Model {
  static table = "workouts";
  static associations: Associations = {
    routines: { type: "belongs_to", key: "routine_id" },
    workout_exercises: { type: "has_many", foreignKey: "workout_id" },
  };

  @field("name") name!: string;
  @date("start_time") startTime!: number;
  @date("end_time") endTime?: number;

  @children("workout_exercises") workoutExercises!: Query<WorkoutExercise>;

  @relation("routine_id", "routines") routine?: Routine;

  @field("user_id") userId?: string;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
