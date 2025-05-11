import { TextInput } from "react-native";
import React from "react";
import { useWorkoutActions, WorkoutExercise } from "@/stores/workoutStore";
import WRExerciseItem from "./WRExerciseItem";

const EditWorkoutExerciseListItem = ({
  exercise,
  index,
  inputRefs,
}: {
  exercise: WorkoutExercise;
  index: number;
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
}) => {
  const { removeExercise, addSetToExercise } = useWorkoutActions();

  return (
    <WRExerciseItem
      type="workout"
      exercise={exercise}
      sets={exercise.sets}
      exerciseIndex={index}
      inputRefs={inputRefs}
      handleDelete={() => removeExercise(index)}
      handleAddSet={() => addSetToExercise(index)}
    />
  );
};

export default EditWorkoutExerciseListItem;
