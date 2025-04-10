import database, {
  setsCollection,
  workoutExercisesCollection,
  workoutsCollection,
} from "@/db";
import { Workout } from "@/models/Workout";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Q } from "@nozbe/watermelondb";

export async function getMaxPRBefore(startTime: number, exerciseId: string) {
  console.log("Fetching previous PRs using PR flags...");

  const prevMaxSetRaw = await setsCollection
    .query(
      Q.unsafeSqlQuery(
        `
      SELECT sets.weight, sets.reps, workouts.start_time
      FROM sets
      JOIN workout_exercises ON sets.workout_exercise_id = workout_exercises.id
      JOIN workouts ON workout_exercises.workout_id = workouts.id
      WHERE workout_exercises.exercise_id = ?
        AND sets.is_weight_pr = 1
        AND workouts.start_time < ?
      ORDER BY workouts.start_time DESC
      LIMIT 1
    `,
        [exerciseId, startTime]
      )
    )
    .unsafeFetchRaw();

  console.log("weight", prevMaxSetRaw);

  const prevMaxVolumeSetRaw = await setsCollection
    .query(
      Q.unsafeSqlQuery(
        `
      SELECT sets.weight, sets.reps, workouts.start_time
      FROM sets
      JOIN workout_exercises ON sets.workout_exercise_id = workout_exercises.id
      JOIN workouts ON workout_exercises.workout_id = workouts.id
      WHERE workout_exercises.exercise_id = ?
        AND sets.is_volume_pr = 1
        AND workouts.start_time < ?
      ORDER BY workouts.start_time DESC
      LIMIT 1
    `,
        [exerciseId, startTime]
      )
    )
    .unsafeFetchRaw();

  console.log("volume", prevMaxVolumeSetRaw);

  const prev1RMSetRaw = await setsCollection
    .query(
      Q.unsafeSqlQuery(
        `
      SELECT sets.weight, sets.reps, workouts.start_time
      FROM sets
      JOIN workout_exercises ON sets.workout_exercise_id = workout_exercises.id
      JOIN workouts ON workout_exercises.workout_id = workouts.id
      WHERE workout_exercises.exercise_id = ?
        AND sets.is_weight_pr = 1
        AND workouts.start_time < ?
      ORDER BY workouts.start_time DESC
      LIMIT 1
    `,
        [exerciseId, startTime]
      )
    )
    .unsafeFetchRaw();

  console.log("1rm", prev1RMSetRaw);

  const date = new Date().getTime();

  return {
    weight: {
      value: prevMaxSetRaw[0]?.weight ?? 0,
      date: prevMaxSetRaw[0]?.start_time,
    },
    volume: {
      value:
        (prevMaxVolumeSetRaw[0]?.weight ?? 0) *
        (prevMaxVolumeSetRaw[0]?.reps ?? 0),
      date: prevMaxSetRaw[0]?.start_time,
    },
    oneRepMax: {
      value:
        (prev1RMSetRaw[0]?.weight ?? 0) *
        (1 + (prev1RMSetRaw[0]?.reps ?? 0) / 30),
      date: prevMaxSetRaw[0]?.start_time,
    },
  };
}

// export async function recalculateFuturePRs(
//   exerciseId: string,
//   workoutId: string
// ) {
//   const workout = await workoutsCollection.find(workoutId);
//   const startTime = workout.startTime;

//   const futureWorkoutExercises = await workoutExercisesCollection
//     .query(
//       Q.where("exercise_id", exerciseId),
//       Q.on("workouts", "start_time", Q.gt(startTime))
//     )
//     .fetch();

//   for (const we of futureWorkoutExercises) {
//     await recalculatePRsForExercise(exerciseId, we.workout.id);
//   }
// }

export async function checkPRs(
  workout: Workout,
  workoutExercises: WorkoutExercise[]
) {
  await Promise.all(
    workoutExercises.map(async (workoutExercise) => {
      const exercise = await workoutExercise.exercise;

      const prevPRs = await getMaxPRBefore(
        new Date(workout.startTime).getTime(),
        exercise.id
      );

      console.log(
        "Previous PRs for exercise:",
        workoutExercise.exercise.title,
        prevPRs
      );

      let newWeightPRSet = null;
      let newVolumePRSet = null;
      let new1RMPRSet = null;

      let maxWeight = prevPRs.weight.value;
      let maxVolume = prevPRs.volume.value;
      let max1RM = prevPRs.oneRepMax.value;

      const sets = await workoutExercise.sets;

      for (const set of sets) {
        const weight = set.weight ?? 0;
        const volume = weight * (set.reps ?? 0);
        const oneRepMax = weight * (1 + (set.reps ?? 0) / 30);

        if (weight > maxWeight) {
          newWeightPRSet = set;
          maxWeight = weight;
        }

        if (volume > maxVolume) {
          newVolumePRSet = set;
          maxVolume = volume;
        }

        if (oneRepMax > max1RM) {
          new1RMPRSet = set;
          max1RM = oneRepMax;
        }
      }

      await database.write(async () => {
        await Promise.all(
          sets.map((set) => {
            return set.update((s) => {
              s.isWeightPr = set.id === newWeightPRSet?.id;
              s.isVolumePr = set.id === newVolumePRSet?.id;
              s.is1RMPr = set.id === new1RMPRSet?.id;
            });
          })
        );
      });
    })
  );
}
