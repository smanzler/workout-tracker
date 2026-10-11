import { useMenu } from "@/hooks/use-menu";
import type { Outputs } from "@rep/api";
import { Alert } from "react-native";
import { useDeleteWorkout } from "./use-delete-workout";
import { useEditWorkout } from "./use-edit-workout";

/** Returns a function that shows the edit and delete actions of a workout. */
export const useWorkoutMenu = () => {
  const showMenu = useMenu();
  const editWorkout = useEditWorkout();
  const { mutate: deleteWorkout } = useDeleteWorkout();

  const confirmDelete = (workoutId: string, onDeleted?: () => void) =>
    Alert.alert("Delete workout?", "You cannot undo this.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteWorkout(
            { id: workoutId },
            {
              onSuccess: onDeleted,
              onError: () =>
                Alert.alert("Could not delete workout", "Try again later."),
            },
          ),
      },
    ]);

  return (
    workout: Outputs["activity"]["workout"]["get"],
    { onDeleted }: { onDeleted?: () => void } = {},
  ) =>
    showMenu([
      { label: "Edit Workout", onSelect: () => editWorkout(workout) },
      {
        label: "Delete Workout",
        destructive: true,
        onSelect: () => confirmDelete(workout.id, onDeleted),
      },
    ]);
};
