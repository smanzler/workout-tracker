import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Exercise } from "@/db/models/exercise";
import { useTheme } from "expo-router/react-navigation";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import ExerciseList from "@/features/activity/components/exercise-list";

function Exercises() {
  return (
    <ExerciseList
      onPress={(item: Exercise) =>
        router.push({
          pathname: "/(modals)/exercise-history",
          params: { exerciseId: item.id, title: item.title },
        })
      }
    />
  );
}

export default Exercises;

const styles = StyleSheet.create({
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 40,
  },
  input: {
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  itemContainer: {
    padding: 10,
    paddingLeft: 20,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
  },
  mgText: {
    fontWeight: 600,
    opacity: 0.6,
  },
});
