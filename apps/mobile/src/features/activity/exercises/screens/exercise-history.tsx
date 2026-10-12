import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { QueryView } from "@/components/query-view";
import { formatCount } from "@/lib/format";
import { exerciseCategoryLabels, muscleGroupLabels } from "../../lib/labels";
import { RecordStrip } from "../components/record-strip";
import { SessionRow } from "../components/session-row";
import { WeightChart } from "../components/weight-chart";
import { useExerciseHistory } from "../hooks/use-exercise-history";

type History = Outputs["activity"]["exercise"]["history"];

const describe = ({ exercise: { muscleGroup, category }, entries }: History) =>
  [
    muscleGroup && muscleGroupLabels[muscleGroup].toUpperCase(),
    category && exerciseCategoryLabels[category].toUpperCase(),
    entries.length > 0 && formatCount(entries.length, "SESSION"),
  ]
    .filter(Boolean)
    .join(" · ");

export default function ExerciseHistory() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const historyQuery = useExerciseHistory(exerciseId);

  return (
    <>
      <Stack.Screen options={{ title: "", headerShadowVisible: false }} />

      <QueryView query={historyQuery} errorTitle="Couldn't load exercise">
        {(history) => (
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerClassName="pb-safe-offset-4"
          >
            <View className="gap-1 border-b border-border px-5 pb-4 pt-1">
              <Text className="text-[30px] font-semibold tracking-tight">
                {history.exercise.title}
              </Text>
              <Text className="font-mono text-[13px] text-muted-foreground">
                {describe(history)}
              </Text>
            </View>

            <RecordStrip records={history.records} />
            <WeightChart entries={history.entries} />
            <Text className="border-b border-foreground px-5 pb-1.5 pt-4 font-mono text-[11px] font-semibold tracking-wider">
              HISTORY
            </Text>
            {history.entries.length === 0 ? (
              <View className="gap-1.5 border-b border-border px-5 py-4">
                <Text className="text-[15px] font-medium">No sessions yet</Text>
                <Text className="text-sm leading-5 text-muted-foreground">
                  Add {history.exercise.title} to a workout. Your sets show
                  here, and the first one sets your records.
                </Text>
              </View>
            ) : (
              history.entries.map((entry) => (
                <SessionRow key={entry.id} entry={entry} />
              ))
            )}
          </ScrollView>
        )}
      </QueryView>
    </>
  );
}
