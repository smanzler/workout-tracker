import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Exercise } from "@/models/Exercise";
import { Set } from "@/models/Set";

const WorkoutExerciseListItem = ({
  workoutExercise,
  exercise,
  sets,
}: {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  sets: Set[];
}) => {
  return (
    <View>
      <Text>WorkoutExerciseListItem</Text>
    </View>
  );
};

const enhance = withObservables(["workoutExercise"], ({ workoutExercise }) => ({
  workoutExercise,
  exercise: workoutExercise.exercise,
  sets: workoutExercise.sets,
}));

export default enhance(WorkoutExerciseListItem);

const styles = StyleSheet.create({});
