import { TextInput } from "react-native";
import React from "react";
import { RoutineExercise, useRoutineActions } from "../stores/routine-store";
import WRExerciseItem from "@/features/activity/components/wr-exercise-item";
import { randomUUID } from "expo-crypto";

const RoutineExerciseListItem = ({
  exercise,
  index,
  inputRefs,
}: {
  exercise: RoutineExercise;
  index: number;
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
}) => {
  const { removeExercise, addSetToExercise } = useRoutineActions();

  return (
    <WRExerciseItem
      type="routine"
      exercise={exercise}
      sets={exercise.sets}
      exerciseIndex={index}
      inputRefs={inputRefs}
      handleDelete={() => removeExercise(index)}
      handleAddSet={() => addSetToExercise(index)}
    />
  );
};

export default RoutineExerciseListItem;
