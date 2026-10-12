import { useHeaderItems } from "@/hooks/use-header-items";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";
import { DraftForm } from "../../components/draft-form";
import { toExerciseInputs } from "../../lib/draft";
import { useCreateRoutine } from "../hooks/use-create-routine";
import { useRoutineDraftStore } from "../stores/routine-draft-store";

export default function AddRoutine() {
  const headerItems = useHeaderItems();
  const name = useRoutineDraftStore((state) => state.name);
  const exercises = useRoutineDraftStore((state) => state.exercises);
  const setName = useRoutineDraftStore((state) => state.setName);
  const updateExercises = useRoutineDraftStore(
    (state) => state.updateExercises,
  );
  const reset = useRoutineDraftStore((state) => state.reset);
  const { mutate: createRoutine, isPending } = useCreateRoutine();

  useEffect(() => reset, [reset]);

  const canSave = name.trim() !== "" && exercises.length > 0 && !isPending;

  const save = () =>
    createRoutine(
      { name: name.trim(), exercises: toExerciseInputs(exercises) },
      {
        onSuccess: () => router.back(),
        onError: () =>
          Alert.alert("Could not save routine", "Try again in a moment."),
      },
    );

  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          {...headerItems.plain}
          onPress={() => router.back()}
        >
          Cancel
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          {...headerItems.prominent}
          disabled={!canSave}
          onPress={save}
        >
          Save
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <DraftForm
        name={name}
        namePlaceholder="Routine name"
        onChangeName={setName}
        exercises={exercises}
        emptyDescription="Add the exercises this routine starts with. Save needs a name and one exercise."
        completable={false}
        onUpdate={updateExercises}
        onAddExercises={() => router.push("/add-routine/add-exercises")}
      />
    </>
  );
}
