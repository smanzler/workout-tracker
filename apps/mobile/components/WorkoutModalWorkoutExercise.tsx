import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { ThemedText } from "./ThemedText";
import { Exercise } from "@/models/Exercise";
import { Set } from "@/models/Set";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { withObservables } from "@nozbe/watermelondb/react";
import WorkoutExerciseItem from "./WorkoutExerciseItem";

const WorkoutModalWorkoutExercise = ({
  workoutExercise,
  exercise,
  sets,
}: {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  sets: Set[];
}) => {
  return <WorkoutExerciseItem exercise={exercise} sets={sets} />;
};

const enhance = withObservables(
  ["workoutExercise"],
  ({ workoutExercise }: { workoutExercise: WorkoutExercise }) => ({
    workoutExercise,
    exercise: workoutExercise.exercise,
    sets: workoutExercise.sets,
  })
);

export default enhance(WorkoutModalWorkoutExercise);
