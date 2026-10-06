import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { WorkoutExercise } from "@/db/models/workout-exercise";
import { Set } from "@/db/models/set";
import { withObservables } from "@nozbe/watermelondb/react";
import { useTheme } from "expo-router/react-navigation";
import { Workout } from "@/db/models/workout";
import { ThemedText } from "@/components/themed-text";
import dayjs from "dayjs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import WorkoutExerciseItem from "@/features/activity/components/workout-exercise-item";
import { Exercise } from "@/db/models/exercise";

const ExerciseHistoryListItem = ({
  workoutExercise,
  exercise,
  workout,
  sets,
}: {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  workout: Workout;
  sets: Set[];
}) => {
  return (
    <WorkoutExerciseItem
      workoutName={workout.name}
      exercise={exercise}
      sets={sets}
    />
  );
};

const enhance = withObservables(
  ["workoutExercise"],
  ({ workoutExercise }: { workoutExercise: WorkoutExercise }) => ({
    workoutExercise,
    exercise: workoutExercise.exercise,
    workout: workoutExercise.workout,
    sets: workoutExercise.sets,
  }),
);

export default enhance(ExerciseHistoryListItem);
