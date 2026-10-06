import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { router, Stack } from "expo-router";
import { Alert, View } from "react-native";
import { DraftForm } from "../../components/draft-form";
import { useElapsedSeconds } from "../hooks/use-elapsed-seconds";
import { useFinishWorkout } from "../hooks/use-finish-workout";
import { formatTimer } from "@/lib/duration";
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
        <DraftForm
          name={name}
          namePlaceholder="Workout name"
          onChangeName={setName}
          exercises={exercises}
          completable
          onUpdate={updateExercises}
          onAddExercises={() => router.push("/add-exercise")}
        >
          <Button variant="ghost" onPress={confirmDiscard}>
            <Text className="text-destructive">Discard Workout</Text>
          </Button>
        </DraftForm>
      )}

      {isPending && (
        <View className="absolute inset-0 items-center justify-center bg-black/40">
          <Spinner className="text-white" />
        </View>
      )}
    </>
  );
}
