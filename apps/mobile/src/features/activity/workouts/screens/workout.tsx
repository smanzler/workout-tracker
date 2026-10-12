import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { router, Stack } from "expo-router";
import { Alert, View } from "react-native";
import { DraftForm } from "../../components/draft-form";
import { buildDraftStats, type Draft } from "../../lib/draft";
import { useElapsedSeconds } from "../hooks/use-elapsed-seconds";
import { useFinishWorkout } from "../hooks/use-finish-workout";
import { formatTimer } from "@/lib/duration";
import { formatWeight } from "@/lib/format";
import { useWorkoutSessionStore } from "../stores/workout-session-store";

function WorkoutStats({ exercises }: { exercises: Draft }) {
  const { volume, completedSets, totalSets } = buildDraftStats(exercises);

  return (
    <View className="flex-row gap-5">
      <Text className="font-mono text-xs text-muted-foreground">
        VOL {formatWeight(volume)}
      </Text>
      <Text className="font-mono text-xs text-muted-foreground">
        SETS {completedSets}/{totalSets}
      </Text>
    </View>
  );
}

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
          headerTitle: ({ children }) => (
            <Text className="font-mono text-base font-medium">{children}</Text>
          ),
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
          summary={<WorkoutStats exercises={exercises} />}
          exercises={exercises}
          completable
          onUpdate={updateExercises}
          onAddExercises={() => router.push("/add-exercise")}
        >
          <Button variant="ghost" size="xl" onPress={confirmDiscard}>
            <Text className="text-destructive">Discard</Text>
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
