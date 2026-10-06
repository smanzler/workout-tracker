import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { router, Stack } from "expo-router";
import { Plus } from "lucide-react-native";
import { Alert, View } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import { ExerciseEditor } from "../../components/exercise-editor";
import { useElapsedSeconds } from "../hooks/use-elapsed-seconds";
import { useFinishWorkout } from "../hooks/use-finish-workout";
import { formatTimer } from "../lib/duration";
import { useWorkoutSessionStore } from "../stores/workout-session-store";

export default function Workout() {
  const startedAt = useWorkoutSessionStore((state) => state.startedAt);
  const name = useWorkoutSessionStore((state) => state.name);
  const exercises = useWorkoutSessionStore((state) => state.exercises);
  const setName = useWorkoutSessionStore((state) => state.setName);
  const updateExercises = useWorkoutSessionStore(
    (state) => state.updateExercises,
  );
  const discard = useWorkoutSessionStore((state) => state.discard);
  const seconds = useElapsedSeconds(startedAt);
  const { finish, isPending } = useFinishWorkout();

  const confirmDiscard = () =>
    Alert.alert("Discard workout?", "The sets of this workout will be lost.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          router.back();
          discard();
        },
      },
    ]);

  return (
    <>
      <Stack.Screen
        options={{
          title: formatTimer(seconds),
          headerRight: () => (
            <Button size="sm" disabled={isPending} onPress={finish}>
              <Text>Finish</Text>
            </Button>
          ),
        }}
      />

      {startedAt !== null && (
        <KeyboardAwareScrollView
          bottomOffset={64}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-3 p-4 pb-safe-offset-4"
        >
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Workout name"
            maxLength={100}
            accessibilityLabel="Workout name"
            className="h-12 border-0 bg-transparent px-0 text-2xl font-semibold shadow-none dark:bg-transparent"
          />

          {exercises.map((exercise) => (
            <ExerciseEditor
              key={exercise.id}
              exercise={exercise}
              completable
              onUpdate={updateExercises}
            />
          ))}

          <Button onPress={() => router.push("/(modals)/add-exercise")}>
            <Icon as={Plus} className="size-4 text-primary-foreground" />
            <Text>Add Exercises</Text>
          </Button>
          <Button variant="ghost" onPress={confirmDiscard}>
            <Text className="text-destructive">Discard Workout</Text>
          </Button>
        </KeyboardAwareScrollView>
      )}
      <KeyboardToolbar />

      {isPending && (
        <View className="absolute inset-0 items-center justify-center bg-black/40">
          <Spinner className="text-white" />
        </View>
      )}
    </>
  );
}
