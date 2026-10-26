import { useHeaderItems } from "@/hooks/use-header-items";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";
import { DraftForm } from "../../components/draft-form";
import {
  hasIncompleteSets,
  keepCompletedSets,
  toExerciseInputs,
} from "../../lib/draft";
import { useUpdateWorkout } from "../hooks/use-update-workout";
import { useWorkoutEditStore } from "../stores/workout-edit-store";

export default function EditWorkout() {
  const headerItems = useHeaderItems();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const name = useWorkoutEditStore((state) => state.name);
  const exercises = useWorkoutEditStore((state) => state.exercises);
  const setName = useWorkoutEditStore((state) => state.setName);
  const updateExercises = useWorkoutEditStore((state) => state.updateExercises);
  const reset = useWorkoutEditStore((state) => state.reset);
  const { mutate: updateWorkout, isPending } = useUpdateWorkout();

  useEffect(() => reset, [reset]);

  const save = () =>
    updateWorkout(
      {
        id: workoutId,
        name: name.trim(),
        exercises: toExerciseInputs(keepCompletedSets(exercises)),
      },
      {
        onSuccess: () => router.back(),
        onError: () =>
          Alert.alert("Could not save workout", "Try again in a moment."),
      },
    );

  const confirmSave = () => {
    if (keepCompletedSets(exercises).length === 0) {
      Alert.alert(
        "No sets done",
        "Mark at least one set as done, or delete the workout.",
      );
      return;
    }

    if (!hasIncompleteSets(exercises)) {
      save();
      return;
    }

    Alert.alert(
      "Save workout?",
      "Sets that are not marked done will not be saved.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Save", onPress: save },
      ],
    );
  };

  return (
    <>
      <Stack.Toolbar placement="left">
        {headerItems.plain({
          label: "Cancel",
          onPress: () => router.back(),
        })}
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        {headerItems.prominent({
          label: "Save",
          disabled: name.trim() === "" || isPending,
          onPress: confirmSave,
        })}
      </Stack.Toolbar>

      <DraftForm
        name={name}
        namePlaceholder="Workout name"
        onChangeName={setName}
        exercises={exercises}
        emptyDescription="Add the exercises you did in this workout."
        completable={true}
        onUpdate={updateExercises}
        onAddExercises={() => router.push("/edit-workout/add-exercises")}
      />
    </>
  );
}
