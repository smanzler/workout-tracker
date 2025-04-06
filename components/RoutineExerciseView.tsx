import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Exercise } from "@/models/Exercise";
import { ThemedText } from "./ThemedText";

const RoutineExerciseView = ({ exercise }: { exercise: Exercise }) => {
  return (
    <View>
      <ThemedText style={{ fontSize: 16 }}>{exercise.title}</ThemedText>
    </View>
  );
};

export default RoutineExerciseView;

const styles = StyleSheet.create({});
