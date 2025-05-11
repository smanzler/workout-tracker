import React from "react";
import { WorkoutExercise } from "@/stores/workoutStore";
import { TextInput } from "react-native";
import { EmptyState } from "./EmptyState";
import EditWorkoutExerciseListItem from "./EditWorkoutExerciseListItem";

const EditWorkoutExerciseList = ({
  exercises,
  inputRefs,
}: {
  exercises: WorkoutExercise[];
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
}) => {
  return (
    <>
      {exercises?.length ? (
        exercises.map((exercise, index) => (
          <EditWorkoutExerciseListItem
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

export default EditWorkoutExerciseList;
