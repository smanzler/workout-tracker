import { StyleSheet, View } from "react-native";
import React from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import WorkoutExerciseListItem from "./WorkoutExerciseListItem";
import { EmptyState } from "./EmptyState";
import { router } from "expo-router";

const WorkoutExerciseList = ({
  workoutExercises,
}: {
  workoutExercises: WorkoutExercise[];
}) => {
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
