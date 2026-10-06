import { StyleSheet, TextInput, View } from "react-native";
import React from "react";
import RoutineExerciseListItem from "./routine-exercise-list-item";
import { RoutineExercise } from "../stores/routine-store";
import { EmptyState } from "@/components/empty-state";
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
