import { Button, StyleSheet, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { useWorkout } from "@/providers/WorkoutProvider";
import { useTheme } from "@react-navigation/native";

const ResumeWorkoutButton = () => {
  const { activeWorkoutId } = useWorkout();
  const theme = useTheme();

  if (!activeWorkoutId) {
    return null;
  }

  const openWorkout = () => {
    router.push("/(modals)/workout");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Button title="Resume workout" onPress={openWorkout} />
    </View>
  );
};

export default ResumeWorkoutButton;

const styles = StyleSheet.create({
  container: {
    height: 50,
    justifyContent: "center",
    position: "absolute",
    bottom: 70,
    margin: 30,
    left: 0,
    right: 0,
    borderRadius: 10,
  },
});
