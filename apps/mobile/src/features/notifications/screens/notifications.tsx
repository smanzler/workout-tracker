import { QueryView } from "@/components/query-view";
import { RefetchControl } from "@/components/refetch-control";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Stack } from "expo-router";
import { Bell } from "lucide-react-native";
import { FlatList } from "react-native";
import { NotificationCard } from "../components/notification-card";
import { useNotifications } from "../hooks/use-notifications";

function NoNotifications() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon as={Bell} />
        </EmptyMedia>
        <EmptyTitle>No notifications yet</EmptyTitle>
      </EmptyHeader>
    </Empty>
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
            contentContainerClassName="grow gap-3 p-4"
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
