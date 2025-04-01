import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Exercise } from "@/models/Exercise";
import { withObservables } from "@nozbe/watermelondb/react";
import { useTheme } from "@react-navigation/native";
import { Set } from "@/models/Set";

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
      <Text
        style={{
          color: theme.colors.text,
          fontWeight: "600",
          width: "50%",
          paddingRight: 10,
          opacity: 0.6,
          fontSize: 16,
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {exercise.title}
      </Text>
      {bestSet ? (
        <Text
          style={{
            color: theme.colors.text,
            fontWeight: "600",
            opacity: 0.6,
            fontSize: 16,
          }}
        >
          {bestSet.weight} lbs × {bestSet.reps}
        </Text>
      ) : (
        <Text style={{ color: theme.colors.text }}>No sets recorded yet</Text>
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
