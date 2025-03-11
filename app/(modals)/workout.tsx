import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useWorkout } from "@/providers/WorkoutProvider";

const Workout = () => {
  const { seconds, startWorkout, stopWorkout } = useWorkout();
  return (
    <View>
      <Text>Workout</Text>
      <TouchableOpacity onPress={startWorkout}>
        <Text>start</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={stopWorkout}>
        <Text>stop</Text>
      </TouchableOpacity>
      <Text>Timer {seconds}</Text>
    </View>
  );
};

export default Workout;

const styles = StyleSheet.create({});
