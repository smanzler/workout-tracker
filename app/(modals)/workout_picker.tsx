import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import WorkoutListShort from "@/components/WorkoutListShort";

const WorkoutPicker = () => {
  const { colors } = useTheme();

  return (
    <BodyScrollView style={{ paddingHorizontal: 20 }}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <WorkoutListShort />
    </BodyScrollView>
  );
};

export default WorkoutPicker;

const styles = StyleSheet.create({});
