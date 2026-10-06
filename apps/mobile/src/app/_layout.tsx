import "@/global.css";
import { ThemeProvider } from "expo-router/react-navigation";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";
import { NAV_THEME } from "@/lib/theme";
import { pullDefaultExercises } from "@/features/activity/exercises/lib/default-exercises";
import { exercisesCollection } from "@/db";
import { Q } from "@nozbe/watermelondb";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as Notifications from "expo-notifications";
import { Toast } from "@/features/notifications/components/toast";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { NetworkProvider } from "@/providers/network-provider";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind, useUniwind } from "uniwind";
import { ApiProvider } from "@/providers/api-provider";
import { authClient } from "@/lib/auth-client";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { TriangleAlert } from "lucide-react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme } = useUniwind();

  const [notification, setNotification] =
    useState<Notifications.Notification>();

  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  async function checkAndSyncDefaults() {
    console.log("checking defaults");
    try {
      const hasSyncedDefaults = await exercisesCollection.query(
        Q.where("is_default", true),
        Q.take(1),
      );

      if (hasSyncedDefaults.length === 0) {
        try {
          await pullDefaultExercises();
          console.log("Default exercises synced on first app open");
        } catch (error) {
          console.error("Error syncing default exercises:", error);
        }
      } else {
        console.log("Default exercises already synced");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkAndSyncDefaults();

    const notificationSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaListener
      onChange={({ insets }) => {
        Uniwind.updateInsets(insets);
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <ActionSheetProvider>
            <ApiProvider>
              <ThemeProvider
                value={NAV_THEME[(theme as "light" | "dark") ?? "light"]}
              >
                <NetworkProvider>
                  <View className="flex-1">
                    <RootLayoutNav />
                    <AuthOverlay />
                    <Toast />
                    <StatusBar style="auto" />
                  </View>
                </NetworkProvider>
              </ThemeProvider>
            </ApiProvider>
          </ActionSheetProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaListener>
  );
}

function RootLayoutNav() {
  const { data: session } = authClient.useSession();

  return (
    <Stack>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

function AuthOverlay() {
  const { isPending, error } = authClient.useSession();

  if (error) {
    return (
      <View className="absolute inset-0 bg-background">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon as={TriangleAlert} />
            </EmptyMedia>
            <EmptyTitle>Oops</EmptyTitle>
            <EmptyDescription>
              Couldn&apos;t connect to the server
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </View>
    );
  }

  if (isPending) {
    return (
      <View className="absolute inset-0 flex-1 justify-center items-center bg-background">
        <Spinner />
      </View>
    );
  }

  return null;
}
