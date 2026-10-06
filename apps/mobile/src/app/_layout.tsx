import "@/global.css";
import { ThemeProvider } from "expo-router/react-navigation";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";
import { NAV_THEME } from "@/lib/theme";
import { restoreTheme } from "@/features/social/profile/lib/theme";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { NetworkProvider } from "@/providers/network-provider";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind, useUniwind } from "uniwind";
import { ApiProvider } from "@/providers/api-provider";
import { authClient } from "@/lib/auth-client";
import { useOnboardingStore } from "@/features/onboarding/stores/onboarding-store";
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
restoreTheme();

export default function RootLayout() {
  const { theme } = useUniwind();

  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

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
  const onboarded = useOnboardingStore((state) => state.completed);

  return (
    <Stack>
      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={onboarded && !session}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={onboarded && !!session}>
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
