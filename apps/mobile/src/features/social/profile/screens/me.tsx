import { WorkoutIndicator } from "@/features/activity/workouts/components/workout-indicator";
import { useHasUnreadNotifications } from "@/features/notifications/hooks/use-has-unread-notifications";
import { router, Stack } from "expo-router";
import { useToolbarIcon } from "@/hooks/use-toolbar-icon";
import { ProfileView } from "../components/profile-view";
import { useMyProfile } from "../hooks/use-my-profile";

export default function Me() {
  const { data: profile } = useMyProfile();
  const hasUnread = useHasUnreadNotifications();
  const settingsIcon = useToolbarIcon("gearshape", "settings");
  const notificationsIcon = useToolbarIcon(
    hasUnread ? "bell.badge" : "bell",
    hasUnread ? "notifications-active" : "notifications",
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "You",
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon={settingsIcon}
          accessibilityLabel="Settings"
          onPress={() => router.push("/(modals)/settings")}
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={notificationsIcon}
          accessibilityLabel={
            hasUnread ? "Notifications, unread" : "Notifications"
          }
          onPress={() => router.push("/notifications")}
        />
      </Stack.Toolbar>
      <ProfileView profileId={profile?.id} />
      <WorkoutIndicator />
    </>
  );
}
