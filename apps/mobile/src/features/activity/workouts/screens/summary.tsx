import type { Outputs } from "@rep/api";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable } from "@/components/ui/pressable";
import { ScrollView, Share, View } from "react-native";
import { QueryView } from "../../components/query-view";
import { SummaryHeader } from "../components/summary-header";
import { WorkoutSummary } from "../components/workout-summary";
import { useWorkout } from "../hooks/use-workout";
import { formatDuration } from "../lib/duration";

const toShareMessage = (workout: Outputs["activity"]["workout"]["get"]) =>
  [
    "🏋️‍♂️ Just crushed a workout on Rep!",
    "",
    `🎯 ${workout.name}`,
    `⏱️ ${formatDuration(workout.endedAt.getTime() - workout.startedAt.getTime())}`,
    `💪 ${workout.exercises.length} exercises completed`,
    "",
    "Feeling stronger every day! 💪",
  ].join("\n");

export default function Summary() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const workoutQuery = useWorkout(workoutId);
  const [headerHeight, setHeaderHeight] = useState(0);

  const share = () => {
    if (workoutQuery.data) {
      Share.share({ message: toShareMessage(workoutQuery.data) });
    }
  };

  return (
    <View className="flex-1 bg-background">
      <QueryView
        query={workoutQuery}
        errorTitle="Couldn't load workout"
        errorDescription="Your workout is saved. Find it in your history."
      >
        {(workout) => (
          <ScrollView
            contentInsetAdjustmentBehavior="never"
            contentContainerClassName="px-4 pb-safe-offset-4"
            contentContainerStyle={{ paddingTop: headerHeight + 16 }}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(modals)/workout-details",
                  params: { workoutId: workout.id },
                })
              }
            >
              <WorkoutSummary workout={workout} />
            </Pressable>
          </ScrollView>
        )}
      </QueryView>
      <View
        className="absolute inset-x-0 top-0"
        onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}
      >
        <SummaryHeader onShare={share} />
      </View>
    </View>
  );
}
