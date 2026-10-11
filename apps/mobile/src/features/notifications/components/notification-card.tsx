import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Outputs } from "@rep/api";
import { Pressable } from "@/components/ui/pressable";
import { View } from "react-native";
import { useMarkNotificationRead } from "../hooks/use-mark-notification-read";
import { openNotification } from "../lib/notification-routes";

type Notification = Outputs["notifications"]["list"][number];

export function NotificationCard({
  notification,
}: {
  notification: Notification;
}) {
  const { mutate: markRead } = useMarkNotificationRead();
  const isUnread = !notification.readAt;

  const open = () => {
    if (isUnread) markRead({ notificationId: notification.id });
    openNotification({ type: notification.type, data: notification.data });
  };

  return (
    <Pressable onPress={open}>
      <Card>
        <CardContent className="flex-row items-start gap-3">
          {isUnread && (
            <View className="mt-1.5 size-2 rounded-full bg-red-500" />
          )}
          <View className="flex-1 gap-1">
            <Text className={cn(isUnread && "font-semibold")}>
              {notification.title}
            </Text>
            {notification.body && (
              <Text variant="muted">{notification.body}</Text>
            )}
            <Text variant="muted" className="mt-1 text-xs">
              {formatDate(notification.createdAt)}
            </Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}
