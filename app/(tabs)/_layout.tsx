import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons size={26} name="person" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons size={26} name="time" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="start_workout"
        options={{
          title: "Start Workout",
          tabBarIcon: ({ color }) => (
            <Ionicons size={26} name="create" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: "Exercises",
          tabBarIcon: ({ color }) => (
            <Ionicons size={26} name="barbell" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
