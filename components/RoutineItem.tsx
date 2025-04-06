import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Routine } from "@/models/Routine";
import { ThemedText } from "./ThemedText";

const RoutineItem = ({ routine }: { routine: Routine }) => {
  return (
    <View>
      <ThemedText>RoutineItem</ThemedText>
    </View>
  );
};

export default RoutineItem;

const styles = StyleSheet.create({});
