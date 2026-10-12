import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { router, Stack } from "expo-router";
import { History as HistoryIcon } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { SectionList } from "react-native";
import { QueryView } from "@/components/query-view";
import { RefetchControl } from "@/components/refetch-control";
import { HistoryRow } from "../components/history-row";
import { MonthHeader } from "../components/month-header";
import { WorkoutIndicator } from "../components/workout-indicator";
import { useWorkoutMenu } from "../hooks/use-workout-menu";
import { useMonthTotals } from "../hooks/use-month-totals";
import { useWorkouts } from "../hooks/use-workouts";
import { groupByMonth } from "../lib/months";

function EmptyHistory() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon as={HistoryIcon} />
        </EmptyMedia>
        <EmptyTitle>No workouts yet</EmptyTitle>
        <EmptyDescription>
          Your finished workouts will show here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onPress={() => router.navigate("/start-workout")}>
          <Text>Start a Workout</Text>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export default function History() {
  const workoutsQuery = useWorkouts();
  const { hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    workoutsQuery;
  const { data: monthTotals, refetch: refetchMonthTotals } = useMonthTotals();
  const showWorkoutMenu = useWorkoutMenu();

  return (
    <>
      <Stack.Screen options={{ title: "History" }} />
      <QueryView query={workoutsQuery} errorTitle="Couldn't load your history">
        {({ pages }) => (
          <SectionList
            sections={groupByMonth(pages.flatMap(({ items }) => items))}
            keyExtractor={({ id }) => id}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerClassName="grow"
            stickySectionHeadersEnabled
            refreshControl={
              <RefetchControl
                refetch={() => Promise.all([refetch(), refetchMonthTotals()])}
              />
            }
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListEmptyComponent={EmptyHistory}
            ListFooterComponent={isFetchingNextPage ? <Spinner /> : null}
            renderSectionHeader={({ section: { key, startedAt } }) => (
              <MonthHeader
                startedAt={startedAt}
                totals={monthTotals?.find(({ month }) => month === key)}
              />
            )}
            renderItem={({ item }) => (
              <Pressable
                testID="workout-card"
                onPress={() =>
                  router.push({
                    pathname: "/workout-details",
                    params: { workoutId: item.id },
                  })
                }
                onLongPress={() => showWorkoutMenu(item)}
              >
                <HistoryRow workout={item} />
              </Pressable>
            )}
          />
        )}
      </QueryView>
      <WorkoutIndicator />
    </>
  );
}
