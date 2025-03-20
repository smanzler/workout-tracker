import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Exercise } from "@/models/Exercise";
import { withObservables } from "@nozbe/watermelondb/react";

const WorkoutExerciseTitle = ({
  workoutExercise,
  exercise,
}: {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
}) => {
  return <Text>{exercise.title}</Text>;
};

const enhance = withObservables(["workoutExercise"], ({ workoutExercise }) => ({
  workoutExercise,
  exercise: workoutExercise.exercise,
}));

export default enhance(WorkoutExerciseTitle);

const styles = StyleSheet.create({});
