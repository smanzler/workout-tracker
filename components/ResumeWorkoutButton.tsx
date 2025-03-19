import { Button, StyleSheet, View } from "react-native";
import React from "react";
import { router } from "expo-router";

const ResumeWorkoutButton = () => {
  const openWorkout = () => {
    router.push("/(modals)/workout");
  };
  return (
    <View style={styles.container}>
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
    backgroundColor: "#d6d6d6",
  },
});
