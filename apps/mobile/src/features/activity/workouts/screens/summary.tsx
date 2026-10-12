import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import { router, useLocalSearchParams } from "expo-router";
import { Share as ShareIcon, X } from "lucide-react-native";
import { ScrollView, Share, View } from "react-native";
import { QueryView } from "@/components/query-view";
import { SummaryExercise } from "../components/summary-exercise";
import { SummaryStats } from "../components/summary-stats";
import { useWorkout } from "../hooks/use-workout";
import { formatDate, formatTime } from "@/lib/date";
import { formatDuration, getWorkoutLength } from "@/lib/duration";

const toShareMessage = (workout: Outputs["activity"]["workout"]["get"]) =>
  [
    "🏋️‍♂️ Just crushed a workout on Rep!",
    "",
    `🎯 ${workout.name}`,
    `⏱️ ${formatDuration(getWorkoutLength(workout))}`,
    `💪 ${workout.exercises.length} exercises completed`,
    "",
    "Feeling stronger every day! 💪",
  ].join("\n");

export default function Summary() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const workoutQuery = useWorkout(workoutId);

  const share = () => {
    if (workoutQuery.data) {
      Share.share({ message: toShareMessage(workoutQuery.data) });
    }
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <View className="flex-row justify-between px-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-11 rounded-full"
          accessibilityLabel="Close"
          onPress={() => router.back()}
        >
          <Icon as={X} className="size-[22px]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 rounded-full"
          accessibilityLabel="Share"
          disabled={!workoutQuery.data}
          onPress={share}
        >
          <Icon as={ShareIcon} className="size-5" />
        </Button>
      </View>

      <QueryView
        query={workoutQuery}
        errorTitle="Couldn't load workout"
        errorDescription="Your workout is saved. Find it in your history."
      >
        {(workout) => (
          <>
            <ScrollView className="flex-1">
              <View className="gap-1 border-b border-border px-5 pb-4 pt-1">
                <Text className="font-mono text-xs font-semibold tracking-widest text-brand">
                  WORKOUT COMPLETE
                </Text>
                <Text className="text-[30px] font-semibold tracking-tight">
                  {workout.name}
                </Text>
                <Text className="font-mono text-[13px] uppercase text-muted-foreground">
                  {formatDate(workout.startedAt)} ·{" "}
                  {formatTime(workout.startedAt)}–{formatTime(workout.endedAt)}
                </Text>
              </View>

              <SummaryStats workout={workout} />

              {workout.exercises.map((exercise) => (
                <SummaryExercise key={exercise.id} exercise={exercise} />
              ))}
            </ScrollView>

            <View className="flex-row gap-2 border-t border-border px-4 pt-3 pb-safe-offset-3">
              <Button
                variant="strong"
                size="xl"
                className="flex-1"
                onPress={() =>
                  router.push({
                    pathname: "/workout-details",
                    params: { workoutId: workout.id },
                  })
                }
              >
                <Text>View Details</Text>
              </Button>
              <Button
                size="xl"
                className="flex-1"
                onPress={() => router.back()}
              >
                <Text>Done</Text>
              </Button>
            </View>
          </>
        )}
      </QueryView>
    </View>
  );
}
