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
import SummaryHeader from "@/features/activity/workouts/components/summary-header";
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
          name="(modals)/workout"
          options={{
            presentation: "modal",
            headerTransparent: Platform.OS === "ios" ? true : false,
            headerBlurEffect: "systemChromeMaterial",
            headerShadowVisible: true,
          }}
        />
        <Stack.Screen
          name="(modals)/add-exercise"
          options={{
            title: "Add Exercises",
            presentation: "fullScreenModal",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="(modals)/summary"
          options={{
            presentation: "fullScreenModal",
            headerTransparent: true,
            header: () => <SummaryHeader handleShare={() => {}} />,
          }}
        />
        <Stack.Screen
          name="(modals)/workout-modal"
          options={{
            presentation: "modal",
            ...(Platform.OS !== "ios"
              ? {}
              : {
                  headerTransparent: true,
                  headerBlurEffect: "systemChromeMaterial",
                  headerShadowVisible: true,
                }),
          }}
        />
        <Stack.Screen
          name="(modals)/edit-workout"
          options={{
            presentation: "modal",
            headerTitle: "Edit Workout",
            headerBackVisible: false,
            ...(Platform.OS !== "ios"
              ? {}
              : {
                  headerTransparent: true,
                  headerBlurEffect: "systemChromeMaterial",
                  headerShadowVisible: true,
                }),
          }}
        />
        <Stack.Screen
          name="(modals)/add-edit-exercises"
          options={{
            headerTitle: "Add Exercises",
          }}
        />
        <Stack.Screen
          name="(modals)/add-routine"
          options={{
            headerTitle: "New Routine",
            headerBackVisible: false,
            ...(Platform.OS !== "ios"
              ? {}
              : {
                  headerTransparent: true,
                  headerBlurEffect: "systemChromeMaterial",
                  headerShadowVisible: true,
                }),
          }}
        />
        <Stack.Screen
          name="(modals)/add-routine-exercises"
          options={{
            headerTitle: "New Routine",
            ...(Platform.OS !== "ios"
              ? {}
              : {
                  headerTransparent: true,
                  headerBlurEffect: "systemChromeMaterial",
                  headerLargeTitle: true,
                  headerLargeTitleShadowVisible: false,
                  headerShadowVisible: true,
                  headerLargeStyle: {
                    backgroundColor: "transparent",
                  },
                }),
          }}
        />
        <Stack.Screen
          name="(modals)/routine-modal"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/exercise-history"
          options={{
            headerTitle: "Exercise",
            headerBackVisible: false,
            ...(Platform.OS !== "ios"
              ? {}
              : {
                  headerTransparent: true,
                  headerBlurEffect: "systemChromeMaterial",
                  headerLargeTitle: true,
                  headerLargeTitleShadowVisible: false,
                  headerShadowVisible: true,
                  headerLargeStyle: {
                    backgroundColor: "transparent",
                  },
                }),
          }}
        />
        <Stack.Screen
          name="(modals)/post"
          options={{
            headerTitle: "Post",
            headerBackVisible: false,
            ...(Platform.OS !== "ios"
              ? {}
              : {
                  headerTransparent: true,
                  headerBlurEffect: "systemChromeMaterial",
                  headerLargeTitle: true,
                  headerLargeTitleShadowVisible: false,
                  headerShadowVisible: true,
                  headerLargeStyle: {
                    backgroundColor: "transparent",
                  },
                }),
          }}
        />
        <Stack.Screen
          name="(modals)/profile"
          options={{
            headerTitle: "Profile",
            headerBackVisible: false,
            ...(Platform.OS !== "ios"
              ? {}
              : {
                  headerBlurEffect: "systemChromeMaterial",
                  headerTransparent: true,
                  headerLargeTitle: true,
                  headerLargeTitleShadowVisible: false,
                  headerShadowVisible: true,
                  headerLargeStyle: {
                    backgroundColor: "transparent",
                  },
                }),
          }}
        />
        <Stack.Screen
          name="(modals)/friends"
          options={{
            headerTitle: "Friends",
            headerBackVisible: false,
            ...(Platform.OS !== "ios"
              ? {}
              : {
                  headerBlurEffect: "systemChromeMaterial",
                  headerTransparent: true,
                }),
          }}
        />
        <Stack.Screen
          name="(modals)/create-post"
          options={{
            headerTitle: "Create Post",
            headerBackVisible: false,
            ...(Platform.OS !== "ios"
              ? {}
              : {
                  headerBlurEffect: "systemChromeMaterial",
                  headerTransparent: true,
                }),
          }}
        />
        <Stack.Screen
          name="(modals)/workout-picker"
          options={{
            headerTitle: "Choose Workout to Add",
            headerBackVisible: false,
            ...(Platform.OS !== "ios"
              ? {}
              : {
                  headerBlurEffect: "systemChromeMaterial",
                  headerTransparent: true,
                }),
          }}
        />
        <Stack.Screen
          name="(modals)/settings"
          options={{
            headerTitle: "Settings",
            headerBackVisible: false,
            ...(Platform.OS !== "ios"
              ? {}
              : {
                  headerBlurEffect: "systemChromeMaterial",
                  headerTransparent: true,
                  headerLargeTitle: true,
                  headerLargeTitleShadowVisible: false,
                  headerShadowVisible: true,
                  headerLargeStyle: {
                    backgroundColor: "transparent",
                  },
                }),
          }}
        />
        <Stack.Screen
          name="(modals)/find-friends"
          options={{
            headerTitle: "Find Friends",
            headerBackVisible: false,
            ...(Platform.OS !== "ios"
              ? {}
              : {
                  headerBlurEffect: "systemChromeMaterial",
                  headerTransparent: true,
                  headerLargeTitle: true,
                  headerLargeTitleShadowVisible: false,
                  headerShadowVisible: true,
                  headerLargeStyle: {
                    backgroundColor: "transparent",
                  },
                }),
          }}
        />
        <Stack.Screen
          name="(modals)/info-modal"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)/notifications"
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
