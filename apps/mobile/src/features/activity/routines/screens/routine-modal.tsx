import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useStartWorkout } from "@/features/activity/workouts/hooks/use-start-workout";
import type { Outputs } from "@rep/api";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { QueryView } from "../../components/query-view";
import { toDraft } from "../../lib/draft";
import { muscleGroupLabels } from "../../lib/labels";
import { useRoutine } from "../hooks/use-routine";

type Routine = Outputs["activity"]["routine"]["get"];

export default function RoutineModal() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const routineQuery = useRoutine(routineId);
  const startWorkout = useStartWorkout();

  const start = (routine: Routine) => {
    router.back();
    startWorkout({
      name: routine.name,
      exercises: toDraft(routine.exercises, { completed: false }),
    });
  };

  return (
    <QueryView query={routineQuery} errorTitle="Couldn't load routine">
      {(routine) => (
        <View className="gap-4 p-6 pb-safe-offset-6">
          <Text variant="h3" numberOfLines={2}>
            {routine.name}
          </Text>

          <View className="gap-2">
            {routine.exercises.map(({ id, exercise, sets }) => (
              <View key={id} className="flex-row items-center gap-2">
                <Text className="flex-1 font-medium" numberOfLines={1}>
                  {sets.length} × {exercise.title}
                </Text>
                {exercise.muscleGroup && (
                  <Text variant="muted">
                    {muscleGroupLabels[exercise.muscleGroup]}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <Button onPress={() => start(routine)}>
            <Text>Start Workout</Text>
          </Button>
        </View>
      )}
    </QueryView>
  );
}
