import { Model, Query } from "@nozbe/watermelondb";
import {
  field,
  date,
  relation,
  children,
} from "@nozbe/watermelondb/decorators";
import { Workout } from "./Workout";
import { Exercise } from "./Exercise";
import { Superset } from "./Superset";
import { Set } from "./Set";
import { Associations } from "@nozbe/watermelondb/Model";

export class WorkoutExercise extends Model {
  static table = "workout_exercises";
  static associations: Associations = {
    workouts: { type: "belongs_to", key: "workout_id" },
    exercises: { type: "belongs_to", key: "exercise_id" },
    supersets: { type: "belongs_to", key: "superset_id" },
    sets: { type: "has_many", foreignKey: "workout_exercise_id" },
  };

  @relation("workouts", "workout_id") workout!: Workout;
  @relation("exercises", "exercise_id") exercise!: Exercise;
  @relation("supersets", "superset_id") superset?: Superset;

  @children("sets") sets!: Query<Set>;

  @field("order") order!: number;

  @field("user_id") userId?: string;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
