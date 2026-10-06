import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Set } from "@/models/Set";
import { withObservables } from "@nozbe/watermelondb/react";
import { useTheme } from "expo-router/react-navigation";
import { Workout } from "@/models/Workout";
import { ThemedText } from "./ThemedText";
import dayjs from "dayjs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import WorkoutExerciseItem from "./WorkoutExerciseItem";
import { Exercise } from "@/models/Exercise";

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
