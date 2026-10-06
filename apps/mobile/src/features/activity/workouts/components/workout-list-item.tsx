import { Pressable, StyleSheet } from "react-native";
import React from "react";
import { Workout } from "@/db/models/workout";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/db/models/workout-exercise";
import database, { setsCollection } from "@/db";
import { useTheme } from "expo-router/react-navigation";
import { Set } from "@/db/models/set";
import { Q } from "@nozbe/watermelondb";
import PostWorkoutSummary, {
  PostWorkout,
} from "@/components/post-workout-summary";
import { Exercise } from "@/db/models/exercise";
import { useMenu } from "@/hooks/use-menu";
import { router } from "expo-router";

const WorkoutListItem = ({
  workout,
  workoutExercises,
  sets,
  exercises,
}: {
  workout: Workout;
  workoutExercises: WorkoutExercise[];
  sets: Set[];
  exercises: Exercise[];
}) => {
  const theme = useTheme();
  const showMenu = useMenu();

  // Create a map of exercise titles
  const exerciseTitles = exercises.reduce(
    (acc, exercise) => {
      const workoutExercise = workoutExercises.find(
        (we) => we.exercise.id === exercise.id,
      );
      if (workoutExercise) {
        acc[workoutExercise.id] = exercise.title;
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  const handleDelete = () => {
    try {
      database.write(async () => {
        const workoutExerciseDeletions = await Promise.all(
          workoutExercises.map((we) => we.markAsDeleted()),
        );
        const setDeletions = await Promise.all(
          sets.map((set) => set.markAsDeleted()),
        );
        const workoutDeletion = await workout.markAsDeleted();

        const batchOps = [
          ...workoutExerciseDeletions,
          ...setDeletions,
          workoutDeletion,
        ];

        await database.batch(...batchOps);
      });
    } catch (error) {
      console.error("Failed to delete workout:", error);
    }
  };

  // Transform the data for PostWorkoutSummary
  const workoutData: PostWorkout = {
    workout_id: workout.id,
    workout_name: workout.name,
    start_time: workout.startTime.toString(),
    end_time: workout.endTime ? workout.endTime.toString() : "",
    exercises: workoutExercises.map((we) => ({
      exercise_title: exerciseTitles[we.id] || "Loading...",
      sets: sets
        .filter((set) => set.workoutExercise.id === we.id)
        .map((set) => ({
          weight: set.weight,
          reps: set.reps,
          is_1rm_pr: set.is1RMPr,
          is_volume_pr: set.isVolumePr,
          is_weight_pr: set.isWeightPr,
        })),
    })),
  };

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/(modals)/workout-modal",
          params: { workoutId: workout.id },
        })
      }
      onLongPress={() =>
        showMenu([
          {
            label: "Edit Workout",
            onSelect: () =>
              router.push({
                pathname: "/(modals)/edit-workout",
                params: { workoutId: workout.id },
              }),
          },
          {
            label: "Delete Workout",
            onSelect: handleDelete,
            destructive: true,
          },
        ])
      }
      style={{ borderRadius: 20, marginBottom: 20, overflow: "hidden" }}
    >
      <PostWorkoutSummary workout={workoutData} />
    </Pressable>
  );
};

const enhance = withObservables(
  ["workout"],
  ({ workout }: { workout: Workout }) => {
    const workoutExercises = workout.workoutExercises.observe();
    const sets = setsCollection
      .query(Q.on("workout_exercises", "workout_id", workout.id))
      .observe();

    // Observe exercises related to this workout's workout exercises
    const exercises = workout.collections
      .get<Exercise>("exercises")
      .query(Q.on("workout_exercises", "workout_id", workout.id))
      .observe();

    return {
      workout,
      workoutExercises,
      sets,
      exercises,
    };
  },
);

export default enhance(WorkoutListItem);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
