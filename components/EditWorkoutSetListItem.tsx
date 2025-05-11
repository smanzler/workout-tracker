import { useWorkoutActions, WorkoutSet } from "@/stores/workoutStore";
import { TextInput } from "react-native";
import WRSetItem from "./WRSetItem";

const EditWorkoutSetListItem = ({
  exerciseIndex,
  set,
  index,
  exerciseId,
  inputRefs,
  previousSetInExercise,
}: {
  exerciseIndex: number;
  set: WorkoutSet;
  index: number;
  exerciseId: string;
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
  previousSetInExercise?: {
    weight?: string;
    reps?: string;
  };
}) => {
  const {
    updateSetReps,
    updateSetWeight,
    removeSetAtIndex,
    updateSetCompleted,
  } = useWorkoutActions();

  return (
    <WRSetItem
      type="workout"
      set={set}
      index={index}
      exerciseIndex={exerciseIndex}
      exerciseId={exerciseId}
      inputRefs={inputRefs}
      handleDelete={() => removeSetAtIndex(exerciseIndex, index)}
      handleUpdate={(field, value) => {
        if (field === "weight") {
          updateSetWeight(exerciseIndex, index, value);
        } else if (field === "reps") {
          updateSetReps(exerciseIndex, index, value);
        }
      }}
      previousSetInExercise={previousSetInExercise}
      toggleCompleted={(newCompleted) => {
        updateSetCompleted(exerciseIndex, index, newCompleted);
      }}
    />
  );
};

export default EditWorkoutSetListItem;
