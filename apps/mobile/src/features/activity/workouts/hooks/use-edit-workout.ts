import type { Outputs } from "@rep/api";
import { router } from "expo-router";
import { toDraft } from "../../lib/draft";
import { useWorkoutEditStore } from "../stores/workout-edit-store";

/** Returns a function that opens the editor with a copy of the workout. */
export const useEditWorkout = () => {
  const load = useWorkoutEditStore((state) => state.load);

  return (workout: Outputs["activity"]["workout"]["get"]) => {
    load({
      name: workout.name,
      exercises: toDraft(workout.exercises, { completed: true }),
    });
    router.push({
      pathname: "/edit-workout",
      params: { workoutId: workout.id },
    });
  };
};
