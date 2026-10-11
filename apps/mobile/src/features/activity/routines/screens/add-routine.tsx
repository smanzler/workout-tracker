import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";
import { DraftForm } from "../../components/draft-form";
import { toExerciseInputs } from "../../lib/draft";
import { useCreateRoutine } from "../hooks/use-create-routine";
import { useRoutineDraftStore } from "../stores/routine-draft-store";

export default function AddRoutine() {
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
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Button variant="ghost" size="sm" onPress={() => router.back()}>
              <Text>Cancel</Text>
            </Button>
          ),
          headerRight: () => (
            <Button size="sm" disabled={!canSave} onPress={save}>
              <Text>Save</Text>
            </Button>
          ),
        }}
      />

      <DraftForm
        name={name}
        namePlaceholder="Routine name"
        onChangeName={setName}
        exercises={exercises}
        completable={false}
        onUpdate={updateExercises}
        onAddExercises={() => router.push("/add-routine-exercises")}
      />
    </>
  );
}
