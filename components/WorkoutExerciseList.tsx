import { StyleSheet, View } from "react-native";
import React from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import WorkoutExerciseListItem from "./WorkoutExerciseListItem";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "./ThemedText";

const WorkoutExerciseList = ({
  workoutExercises,
}: {
  workoutExercises: WorkoutExercise[];
}) => {
  const theme = useTheme();
  return (
    <>
      {workoutExercises?.length ? (
        workoutExercises.map((workoutExercise) => (
          <WorkoutExerciseListItem
            key={workoutExercise.id}
            workoutExercise={workoutExercise}
          />
        ))
      ) : (
        <View style={{ alignItems: "center", padding: 40 }}>
          <Ionicons name="barbell" color={theme.colors.text} size={50} />
          <ThemedText type="subtitle">Get Started</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ opacity: 0.6 }}>
            Add exercises to get started
          </ThemedText>
        </View>
      )}
    </>
  );
};

const enhance = withObservables(["workout"], ({ workout }) => ({
  workoutExercises: workout.workoutExercises,
}));

export default enhance(WorkoutExerciseList);

const styles = StyleSheet.create({});
