import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Link } from "expo-router";
import { Bell } from "lucide-react-native";
import { View } from "react-native";
import { useNotifications } from "../hooks/use-notifications";

export function NotificationsBellButton() {
  const { data: notifications } = useNotifications();
  const hasUnread = notifications?.some(({ readAt }) => !readAt);

  return (
    <Link href="/notifications" asChild>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full"
        accessibilityLabel={
          hasUnread ? "Notifications, unread" : "Notifications"
        }
      >
        <Icon as={Bell} />
        {hasUnread && (
          <View className="absolute top-1 right-1 size-2 rounded-full bg-red-500" />
        )}
      </Button>
    </Link>
  );
}
