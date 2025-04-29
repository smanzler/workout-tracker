import { StyleSheet, View } from "react-native";
import React from "react";
import RoutineExerciseListItem from "./RoutineExerciseListItem";
import { RoutineExercise } from "@/stores/routineStore";
import { EmptyState } from "./EmptyState";
import { useTheme } from "@react-navigation/native";

const RoutineExerciseList = ({
  exercises,
}: {
  exercises: RoutineExercise[];
}) => {
  const theme = useTheme();
  return (
    <>
      {exercises?.length ? (
        exercises.map((exercise, index) => (
          <RoutineExerciseListItem
            key={index}
            exercise={exercise}
            index={index}
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

export default RoutineExerciseList;

const styles = StyleSheet.create({});
