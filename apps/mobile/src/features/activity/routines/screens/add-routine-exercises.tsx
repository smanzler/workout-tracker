import { router } from "expo-router";
import { ExercisePicker } from "../../components/exercise-picker";
import { addExercises } from "../../lib/draft";
import { useRoutineDraftStore } from "../stores/routine-draft-store";

export default function AddRoutineExercises() {
  const updateExercises = useRoutineDraftStore(
    (state) => state.updateExercises,
  );

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
