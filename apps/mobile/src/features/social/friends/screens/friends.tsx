import { QueryView } from "@/components/query-view";
import { RefetchControl } from "@/components/refetch-control";
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
import { Text } from "@/components/ui/text";
import { router, Stack } from "expo-router";
import { UserPlus, Users } from "lucide-react-native";
import { FlatList } from "react-native";
import { HeaderLink } from "../../components/header-link";
import { FeedWorkoutCard } from "../components/feed-workout-card";
import { useFriendsFeed } from "../hooks/use-friends-feed";

function EmptyFeed() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon as={Users} />
        </EmptyMedia>
        <EmptyTitle>No activity yet</EmptyTitle>
        <EmptyDescription>
          Follow friends to see their workouts here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onPress={() => router.push("/add-friends")}>
          <Text>Add Friends</Text>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export default function Friends() {
  const feedQuery = useFriendsFeed();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Friends",
          headerBackButtonDisplayMode: "minimal",
          headerRight: () => (
            <HeaderLink
              icon={UserPlus}
              label="Add friends"
              href="/add-friends"
            />
          ),
        }}
      />
      <QueryView query={feedQuery} errorTitle="Couldn't load your feed">
        {(feed) => (
          <FlatList
            data={feed}
            keyExtractor={({ id }) => id}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerClassName="grow"
            refreshControl={<RefetchControl refetch={feedQuery.refetch} />}
            ListEmptyComponent={EmptyFeed}
            renderItem={({ item }) => <FeedWorkoutCard workout={item} />}
          />
        )}
      </QueryView>
    </>
  );
}
