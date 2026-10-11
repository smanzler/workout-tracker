import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { useNotificationTaps } from "@/features/notifications/hooks/use-notification-taps";
import { usePushNotificationRegistration } from "@/features/notifications/hooks/use-push-notification-registration";
import { useMyProfile } from "@/features/social/profile/hooks/use-my-profile";
import { Stack } from "expo-router";
import { TriangleAlert } from "lucide-react-native";
import { Platform, View } from "react-native";

export default function Layout() {
  usePushNotificationRegistration();
  useNotificationTaps();
  const { data: profile, isPending, isError } = useMyProfile();

  if (isPending) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner />
      </View>
    );
  }

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon as={TriangleAlert} />
          </EmptyMedia>
          <EmptyTitle>Fetch Failed</EmptyTitle>
          <EmptyDescription>
            Something went wrong trying to fetch your profile, please try again
            later.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Stack>
      <Stack.Protected guard={!!profile}>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, title: "Home", animation: "none" }}
        />
        <Stack.Screen
          name="workout"
          options={{
            presentation: "modal",
            headerTransparent: Platform.OS === "ios",
            headerBlurEffect: "systemChromeMaterial",
            headerShadowVisible: true,
          }}
        />
        <Stack.Screen
          name="add-exercise"
          options={{ title: "Add Exercises", presentation: "modal" }}
        />
        <Stack.Screen
          name="workout-summary"
          options={{ presentation: "fullScreenModal", headerShown: false }}
        />
        <Stack.Screen
          name="workout-details"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="edit-workout"
          options={{ title: "Edit Workout", presentation: "modal" }}
        />
        <Stack.Screen
          name="add-edit-exercises"
          options={{ title: "Add Exercises", presentation: "modal" }}
        />
        <Stack.Screen
          name="add-routine"
          options={{ title: "New Routine", presentation: "modal" }}
        />
        <Stack.Screen
          name="add-routine-exercises"
          options={{ title: "Add Exercises", presentation: "modal" }}
        />
        <Stack.Screen
          name="routine"
          options={{
            presentation: "formSheet",
            sheetAllowedDetents: "fitToContents",
            sheetGrabberVisible: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="exercise-history"
          options={{ headerBackButtonDisplayMode: "minimal" }}
        />
        <Stack.Screen
          name="new-exercise"
          options={{ title: "New Exercise", presentation: "modal" }}
        />
        <Stack.Screen name="friends" />
        <Stack.Screen name="add-friends" />
        <Stack.Screen name="profile" options={{ title: "" }} />
        <Stack.Screen
          name="(modals)"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen name="notifications" />
      </Stack.Protected>
      <Stack.Protected guard={!profile}>
        <Stack.Screen name="profile/create" />
      </Stack.Protected>
      <Stack.Screen name="terms" />
    </Stack>
  );
}
