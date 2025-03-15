import { Model } from "@nozbe/watermelondb";
import { field, date, relation } from "@nozbe/watermelondb/decorators";
import { Workout } from "./Workout";
import { Exercise } from "./Exercise";
import { Superset } from "./Superset";

export class WorkoutExercise extends Model {
  static table = "workout_exercises";

  @relation("workouts", "workout_id") workout!: Workout;
  @relation("exercises", "exercise_id") exercise!: Exercise;
  @relation("supersets", "superset_id") superset!: Superset | null;

  @field("order") order!: number;

  @date("created_at") createdAt!: number;
  @date("updated_at") updatedAt!: number;
}
