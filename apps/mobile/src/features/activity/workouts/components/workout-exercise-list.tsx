import { StyleSheet, View, TextInput } from "react-native";
import React from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/db/models/workout-exercise";
import WorkoutExerciseListItem from "./workout-exercise-list-item";
import { EmptyState } from "@/components/empty-state";
import { router } from "expo-router";

const WorkoutExerciseList = ({
  workoutExercises,
  inputRefs,
}: {
  workoutExercises: WorkoutExercise[];
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
}) => {
  return (
    <>
      {workoutExercises?.length ? (
        workoutExercises.map((workoutExercise, exerciseIndex) => (
          <WorkoutExerciseListItem
            key={workoutExercise.id}
            workoutExercise={workoutExercise}
            exerciseIndex={exerciseIndex}
            inputRefs={inputRefs}
          />
        ))
      ) : (
        <EmptyState
          icon="log-in-outline"
          title="Get Started"
          description="Add exercises to get started"
        />
      )}
    </>
  );
};

const enhance = withObservables(["workout"], ({ workout }) => ({
  workoutExercises: workout.workoutExercises,
}));

export default enhance(WorkoutExerciseList);

const styles = StyleSheet.create({});
