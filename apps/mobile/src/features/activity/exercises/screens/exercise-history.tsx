import { BodyScrollView } from "@/components/ui/body-scroll-view";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Dumbbell } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { QueryView } from "@/components/query-view";
import { SetListCard } from "../../components/set-list-card";
import { formatDate } from "@/lib/date";
import { exerciseCategoryLabels, muscleGroupLabels } from "../../lib/labels";
import { PersonalRecordCards } from "../components/personal-record-cards";
import { WeightChart } from "../components/weight-chart";
import { useExerciseHistory } from "../hooks/use-exercise-history";

type Exercise = Outputs["activity"]["exercise"]["history"]["exercise"];

const describe = ({ muscleGroup, category }: Exercise) =>
  [
    muscleGroup && muscleGroupLabels[muscleGroup],
    category && exerciseCategoryLabels[category],
  ]
    .filter(Boolean)
    .join(" · ");

export default function ExerciseHistory() {
  const { exerciseId, title } = useLocalSearchParams<{
    exerciseId: string;
    title?: string;
  }>();
  const historyQuery = useExerciseHistory(exerciseId);

  return (
    <>
      <Stack.Screen
        options={{ title: historyQuery.data?.exercise.title ?? title ?? "" }}
      />

      <QueryView query={historyQuery} errorTitle="Couldn't load exercise">
        {({ exercise, entries, records }) => (
          <BodyScrollView>
            <Text variant="muted">{describe(exercise)}</Text>

            {entries.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Icon as={Dumbbell} />
                  </EmptyMedia>
                  <EmptyTitle>No history yet</EmptyTitle>
                  <EmptyDescription>
                    Do this exercise in a workout to see your records here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <PersonalRecordCards records={records} />
                <WeightChart entries={entries} />
                <Text variant="h4">History</Text>
                {entries.map((entry) => (
                  <Pressable
                    key={entry.id}
                    onPress={() =>
                      router.push({
                        pathname: "/workout-details",
                        params: { workoutId: entry.workoutId },
                      })
                    }
                  >
                    <SetListCard
                      title={entry.workoutName}
                      description={formatDate(entry.startedAt)}
                      sets={entry.sets}
                    />
                  </Pressable>
                ))}
              </>
            )}
          </BodyScrollView>
        )}
      </QueryView>
    </>
  );
}
