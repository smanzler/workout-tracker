import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Workout } from "@/models/Workout";

const WorkoutListItem = ({ workout }: { workout: Workout }) => {
  return (
    <View>
      <Text>{workout.startTime.toString()}</Text>
    </View>
  );
};

export default WorkoutListItem;

const styles = StyleSheet.create({});
