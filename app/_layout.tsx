import { ThemeProvider, useTheme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import AuthProvider from "@/providers/AuthProvider";
import { SyncProvider } from "@/providers/SyncProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WorkoutProvider } from "@/providers/WorkoutProvider";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DarkTheme, DefaultTheme } from "@/constants/Colors";
import { pullDefaultExercises } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { exercisesCollection, setsCollection } from "@/db";
import { Q } from "@nozbe/watermelondb";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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
        Q.where("is_default", true)
      );

      if (hasSyncedDefaults.length === 0) {
        try {
          await pullDefaultExercises();
          await AsyncStorage.setItem("hasSyncedDefaultExercises", "true");
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
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <WorkoutProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <SyncProvider>
              <View style={{ flex: 1 }}>
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(modals)/workout"
                    options={{ presentation: "modal", headerShown: false }}
                  />
                  <Stack.Screen
                    name="(modals)/add_exercise"
                    options={{
                      title: "Add Exercises",
                      presentation: "fullScreenModal",
                      headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                          <Ionicons
                            name="chevron-back"
                            size={24}
                            color={theme.colors.primary}
                          />
                        </TouchableOpacity>
                      ),
                    }}
                  />
                  <Stack.Screen
                    name="(modals)/summary"
                    options={{
                      presentation: "fullScreenModal",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="(auth)/signup"
                    options={{
                      headerShown: true,
                      headerTitle: "Sign Up",
                      ...(process.env.EXPO_OS !== "ios"
                        ? {}
                        : {
                            headerLargeTitle: true,
                            headerTransparent: true,
                            headerBlurEffect: "systemChromeMaterial",
                            headerLargeTitleShadowVisible: false,
                            headerShadowVisible: true,
                            headerLargeStyle: {
                              backgroundColor: "transparent",
                            },
                          }),
                    }}
                  />
                  <Stack.Screen
                    name="(modals)/workout_modal"
                    options={{
                      presentation: "transparentModal",
                      animation: "fade",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="(modals)/add_routine"
                    options={{
                      headerTitle: "New Routine",
                      headerBackVisible: false,
                      headerTransparent: true,
                      headerBlurEffect: "systemChromeMaterial",
                    }}
                  />
                  <Stack.Screen
                    name="(modals)/add_routine_exercises"
                    options={{
                      headerTitle: "New Routine",
                      headerTransparent: true,
                      headerBlurEffect: "systemChromeMaterial",
                      headerLargeTitle: true,
                      headerLargeTitleShadowVisible: false,
                      headerShadowVisible: true,
                      headerLargeStyle: {
                        backgroundColor: "transparent",
                      },
                    }}
                  />
                  <Stack.Screen
                    name="(modals)/routine_modal"
                    options={{
                      presentation: "transparentModal",
                      animation: "fade",
                      headerShown: false,
                    }}
                  />
                </Stack>

                <StatusBar style="auto" />
              </View>
            </SyncProvider>
          </ThemeProvider>
        </WorkoutProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
