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

  const prevMaxSet = await setsCollection
    .query(
      Q.on("workout_exercises", "exercise_id", exerciseId),
      Q.where("workout_start_time", Q.lt(startTime)),
      Q.where("is_weight_pr", true),
      Q.sortBy("workout_start_time", Q.desc),
      Q.take(1)
    )
    .fetch();

  const prevMaxVolumeSet = await setsCollection
    .query(
      Q.on("workout_exercises", "exercise_id", exerciseId),
      Q.where("workout_start_time", Q.lt(startTime)),
      Q.where("is_volume_pr", true),
      Q.sortBy("workout_start_time", Q.desc),
      Q.take(1)
    )
    .fetch();

  const prevMax1RMSet = await setsCollection
    .query(
      Q.on("workout_exercises", "exercise_id", exerciseId),
      Q.where("workout_start_time", Q.lt(startTime)),
      Q.where("is_1rm_pr", true),
      Q.sortBy("workout_start_time", Q.desc),
      Q.take(1)
    )
    .fetch();

  return {
    weight: {
      value: prevMaxSet[0]?.weight ?? 0,
      date: prevMaxSet[0]?.workoutStartTime,
    },
    volume: {
      value:
        (prevMaxVolumeSet[0]?.weight ?? 0) * (prevMaxVolumeSet[0]?.reps ?? 0),
      date: prevMaxSet[0]?.workoutStartTime,
    },
    oneRepMax: {
      value:
        (prevMax1RMSet[0]?.weight ?? 0) *
        (1 + (prevMax1RMSet[0]?.reps ?? 0) / 30),
      date: prevMaxSet[0]?.workoutStartTime,
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
