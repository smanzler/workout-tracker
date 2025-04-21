import { StyleSheet, View } from "react-native";
import React from "react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Exercise } from "@/models/Exercise";
import { withObservables } from "@nozbe/watermelondb/react";
import { useTheme } from "@react-navigation/native";
import { Set } from "@/models/Set";
import { ThemedText } from "./ThemedText";

const WorkoutExerciseTitle = ({
  workoutExercise,
  exercise,
  sets,
}: {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  sets: Set[] | null;
}) => {
  const theme = useTheme();

  const bestSet = sets?.reduce((best, current) => {
    const bestWeight = best.weight ?? 0;
    const bestReps = best.reps ?? 0;
    const currentWeight = current.weight ?? 0;
    const currentReps = current.reps ?? 0;

    return currentWeight * currentReps > bestWeight * bestReps ? current : best;
  }, sets?.[0]);

  return (
    <View style={styles.container}>
      <ThemedText
        style={{
          width: "50%",
          paddingRight: 10,
          opacity: 0.6,
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {sets?.length} × {exercise.title}
      </ThemedText>
      {bestSet ? (
        <ThemedText
          style={{
            opacity: 0.6,
          }}
        >
          {bestSet.weight} lbs × {bestSet.reps}
        </ThemedText>
      ) : (
        <ThemedText>No sets recorded yet</ThemedText>
      )}
    </View>
  );
};

const enhance = withObservables(
  ["workoutExercise"],
  ({ workoutExercise }: { workoutExercise: WorkoutExercise }) => ({
    workoutExercise,
    exercise: workoutExercise.exercise,
    sets: workoutExercise.sets,
  })
);

export default enhance(WorkoutExerciseTitle);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
});
