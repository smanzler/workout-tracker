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
import { router } from "expo-router";
import { History as HistoryIcon } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { FlatList } from "react-native";
import { QueryView } from "@/components/query-view";
import { RefetchControl } from "@/components/refetch-control";
import { WorkoutSummary } from "@/components/workout-summary";
import { useWorkoutMenu } from "../hooks/use-workout-menu";
import { useWorkouts } from "../hooks/use-workouts";

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
  const showWorkoutMenu = useWorkoutMenu();

  return (
    <QueryView query={workoutsQuery} errorTitle="Couldn't load your history">
      {({ pages }) => (
        <FlatList
          data={pages.flatMap(({ items }) => items)}
          keyExtractor={({ id }) => id}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="grow gap-3 p-4"
          refreshControl={<RefetchControl refetch={refetch} />}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListEmptyComponent={EmptyHistory}
          ListFooterComponent={isFetchingNextPage ? <Spinner /> : null}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/workout-details",
                  params: { workoutId: item.id },
                })
              }
              onLongPress={() => showWorkoutMenu(item)}
            >
              <WorkoutSummary workout={item} />
            </Pressable>
          )}
        />
      )}
    </QueryView>
  );
}
