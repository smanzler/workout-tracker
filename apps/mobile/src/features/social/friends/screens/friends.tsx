import { QueryView } from "@/components/query-view";
import { RefetchControl } from "@/components/refetch-control";
import { Button } from "@/components/ui/button";
import { EmptyRow } from "@/components/empty-row";
import { Text } from "@/components/ui/text";
import { useToolbarIcon } from "@/hooks/use-toolbar-icon";
import { router, Stack } from "expo-router";
import { FlatList } from "react-native";
import { WorkoutIndicator } from "@/features/activity/workouts/components/workout-indicator";
import { FeedWorkoutCard } from "../components/feed-workout-card";
import { useFriendsFeed } from "../hooks/use-friends-feed";

function EmptyFeed() {
  return (
    <EmptyRow
      title="No activity yet"
      description="Follow friends and their workouts show here."
    >
      <Button
        size="sm"
        className="mt-2"
        onPress={() => router.push("/add-friends")}
      >
        <Text>Add Friends</Text>
      </Button>
    </EmptyRow>
  );
}

export default function Friends() {
  const feedQuery = useFriendsFeed();
  const addFriendsIcon = useToolbarIcon("person.badge.plus", "person-add");

  return (
    <>
      <Stack.Screen options={{ title: "Friends" }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={addFriendsIcon}
          accessibilityLabel="Add friends"
          onPress={() => router.push("/add-friends")}
        />
      </Stack.Toolbar>
      <QueryView query={feedQuery} errorTitle="Couldn't load your feed">
        {(feed) => (
          <FlatList
            data={feed}
            keyExtractor={({ id }) => id}
            contentInsetAdjustmentBehavior="automatic"
            refreshControl={<RefetchControl refetch={feedQuery.refetch} />}
            ListEmptyComponent={EmptyFeed}
            renderItem={({ item }) => <FeedWorkoutCard workout={item} />}
          />
        )}
      </QueryView>
      <WorkoutIndicator />
    </>
  );
}
