import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { router, Stack } from "expo-router";
import { Plus } from "lucide-react-native";
import { useEffect } from "react";
import { Alert } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import { ExerciseEditor } from "../../components/exercise-editor";
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

      <KeyboardAwareScrollView
        bottomOffset={64}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-3 p-4 pb-safe-offset-4"
      >
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Routine name"
          maxLength={100}
          accessibilityLabel="Routine name"
          className="h-12 border-0 bg-transparent px-0 text-2xl font-semibold shadow-none dark:bg-transparent"
        />

        {exercises.map((exercise) => (
          <ExerciseEditor
            key={exercise.id}
            exercise={exercise}
            completable={false}
            onUpdate={updateExercises}
          />
        ))}

        <Button onPress={() => router.push("/(modals)/add-routine-exercises")}>
          <Icon as={Plus} className="size-4 text-primary-foreground" />
          <Text>Add Exercises</Text>
        </Button>
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
}
