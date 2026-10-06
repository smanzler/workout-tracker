import { Database } from "@nozbe/watermelondb";
import { Exercise } from "../models/Exercise";
import { Workout } from "../models/Workout";
import { WorkoutExercise } from "../models/WorkoutExercise";
import { Set } from "../models/Set";
import Papa from "papaparse";
import { Q } from "@nozbe/watermelondb";
import { recalculateAllPRs } from "./PRs";

interface StrongCSVRow {
  Date: string;
  "Workout Name": string;
  Duration: string;
  "Exercise Name": string;
  "Set Order": string;
  Weight: string;
  Reps: string;
  Distance: string;
  Seconds: string;
  Notes: string;
  "Workout Notes": string;
  RPE: string;
}

export async function importStrongCSV(
  database: Database,
  csvContent: string,
  userId?: string
) {
  await database.write(async () => {
    const { data } = Papa.parse<StrongCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    // Group rows by workout (Date + Workout Name combination)
    const workoutGroups = data.reduce(
      (groups: Record<string, StrongCSVRow[]>, row: StrongCSVRow) => {
        const key = `${row.Date}_${row["Workout Name"]}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(row);
        return groups;
      },
      {} as Record<string, StrongCSVRow[]>
    );

    // Process each workout
    for (const [workoutKey, rows] of Object.entries(workoutGroups)) {
      const firstRow = rows[0] as StrongCSVRow;
      const startTime = new Date(firstRow.Date).getTime();

      // Calculate end time based on duration
      const duration = parseDuration(firstRow.Duration);
      const endTime = startTime + duration;

      // Create workout
      const workout = await database.collections
        .get<Workout>("workouts")
        .create((workout) => {
          workout.name = firstRow["Workout Name"];
          workout.startTime = startTime;
          workout.endTime = endTime;
          workout.userId = userId;
        });

      // Group exercises within workout
      const exerciseGroups = (rows as StrongCSVRow[]).reduce(
        (groups: Record<string, StrongCSVRow[]>, row: StrongCSVRow) => {
          if (!groups[row["Exercise Name"]]) {
            groups[row["Exercise Name"]] = [];
          }
          groups[row["Exercise Name"]].push(row);
          return groups;
        },
        {} as Record<string, StrongCSVRow[]>
      );

      // Process each exercise
      for (const [exerciseName, exerciseRows] of Object.entries(
        exerciseGroups
      )) {
        // Create or find exercise
        let exercise = await database.collections
          .get<Exercise>("exercises")
          .query(Q.where("title", exerciseName))
          .fetch()
          .then((results) => results[0]);

        if (!exercise) {
          exercise = await database.collections
            .get<Exercise>("exercises")
            .create((exercise) => {
              exercise.title = exerciseName;
              exercise.isDefault = false;
              exercise.userId = userId;
            });
        }

        // Create workout exercise
        const workoutExercise = await database.collections
          .get<WorkoutExercise>("workout_exercises")
          .create((we) => {
            (we as any).workout.id = workout.id;
            (we as any).exercise.id = exercise.id;
            we.notes = exerciseRows[0].Notes || undefined;
            we.userId = userId;
          });

        // Create sets
        const setRows = (exerciseRows as StrongCSVRow[]).filter(
          (row) => row["Set Order"] !== "Rest Timer"
        );
        for (const [index, row] of setRows.entries()) {
          await database.collections.get<Set>("sets").create((set) => {
            (set as any).workoutExercise.id = workoutExercise.id;
            set.weight = row.Weight ? parseFloat(row.Weight) : undefined;
            set.reps = row.Reps ? parseFloat(row.Reps) : undefined;
            set.completed = true;
            set.position = index;
            set.isVolumePr = false;
            set.is1RMPr = false;
            set.isWeightPr = false;
            set.userId = userId;
          });
        }
      }
    }
  });

  await recalculateAllPRs();
}

function parseDuration(duration: string): number {
  if (!duration) return 0;

  const hours = duration.match(/(\d+)h/)?.[1];
  const minutes = duration.match(/(\d+)m/)?.[1];
  const seconds = duration.match(/(\d+)s/)?.[1];

  return (
    (hours ? parseInt(hours) * 3600000 : 0) +
    (minutes ? parseInt(minutes) * 60000 : 0) +
    (seconds ? parseInt(seconds) * 1000 : 0)
  );
}
