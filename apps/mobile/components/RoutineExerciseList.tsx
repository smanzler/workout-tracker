import { StyleSheet, TextInput, View } from "react-native";
import React from "react";
import RoutineExerciseListItem from "./RoutineExerciseListItem";
import { RoutineExercise } from "@/stores/routineStore";
import { EmptyState } from "./EmptyState";
import { useTheme } from "expo-router/react-navigation";

const RoutineExerciseList = ({
  exercises,
  inputRefs,
}: {
  exercises: RoutineExercise[];
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
}) => {
  return (
    <>
      {exercises?.length ? (
        exercises.map((exercise, index) => (
          <RoutineExerciseListItem
            key={index}
            exercise={exercise}
            index={index}
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

export default RoutineExerciseList;
