import { router } from "expo-router";
import { ExercisePicker } from "../../components/exercise-picker";
import { addExercises } from "../../lib/draft";
import { useWorkoutSessionStore } from "../stores/workout-session-store";

export default function AddExercise() {
  const updateExercises = useWorkoutSessionStore(
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
