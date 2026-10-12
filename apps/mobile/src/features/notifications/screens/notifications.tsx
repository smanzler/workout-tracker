import { QueryView } from "@/components/query-view";
import { RefetchControl } from "@/components/refetch-control";
import { EmptyRow } from "@/components/empty-row";
import { Stack } from "expo-router";
import { FlatList } from "react-native";
import { NotificationCard } from "../components/notification-card";
import { useNotifications } from "../hooks/use-notifications";

function NoNotifications() {
  return (
    <EmptyRow
      title="No notifications yet"
      description="New followers and kudos on your workouts show here."
    />
  );
}

export default function Notifications() {
  const notificationsQuery = useNotifications();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Notifications",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <QueryView
        query={notificationsQuery}
        errorTitle="Couldn't load notifications"
      >
        {(notifications) => (
          <FlatList
            data={notifications}
            keyExtractor={({ id }) => id}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerClassName={
              notifications.length > 0 ? "gap-3 p-4" : undefined
            }
            refreshControl={
              <RefetchControl refetch={notificationsQuery.refetch} />
            }
            ListEmptyComponent={NoNotifications}
            renderItem={({ item }) => <NotificationCard notification={item} />}
          />
        )}
      </QueryView>
    </>
  );
}
