import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { useMyProfile } from "@/features/social/profile/hooks/use-my-profile";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import { TriangleAlert } from "lucide-react-native";
import { Platform, TouchableOpacity, View } from "react-native";

export default function Layout() {
  const { colors } = useTheme();
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
        <Stack.Screen
          name="notifications"
          options={{
            headerTitle: "Notifications",
            headerBackVisible: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!profile}>
        <Stack.Screen name="profile/create" />
      </Stack.Protected>
      <Stack.Screen name="terms" />
    </Stack>
  );
}
