import { router } from "expo-router";
import { ExercisePicker } from "../../components/exercise-picker";
import { addExercises } from "../../lib/draft";
import { useWorkoutEditStore } from "../stores/workout-edit-store";

export default function AddEditExercises() {
  const updateExercises = useWorkoutEditStore((state) => state.updateExercises);

  return (
    <ExercisePicker
      actionLabel="Add"
      onAdd={(exercises) => {
        updateExercises((draft) => addExercises(draft, exercises));
        router.back();
      }}
    />
  );
}
