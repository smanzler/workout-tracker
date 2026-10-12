import { WorkoutIndicator } from "@/features/activity/workouts/components/workout-indicator";
import { useHasUnreadNotifications } from "@/features/notifications/hooks/use-has-unread-notifications";
import { router, Stack } from "expo-router";
import { ProfileView } from "../components/profile-view";
import { useMyProfile } from "../hooks/use-my-profile";

export default function Me() {
  const { data: profile } = useMyProfile();
  const hasUnread = useHasUnreadNotifications();

  return (
    <>
      <Stack.Screen
        options={{
          title: "You",
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="gearshape"
          accessibilityLabel="Settings"
          onPress={() => router.push("/(modals)/settings")}
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={hasUnread ? "bell.badge" : "bell"}
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
