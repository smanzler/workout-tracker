import { StyleSheet, View } from "react-native";
import React from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "./ThemedText";
import RoutineExerciseListItem from "./RoutineExerciseListItem";
import { RoutineExercise } from "@/stores/routineStore";

const RoutineExerciseList = ({
  exercises,
}: {
  exercises: RoutineExercise[];
}) => {
  const theme = useTheme();
  return (
    <>
      {exercises?.length ? (
        exercises.map((exercise, index) => (
          <RoutineExerciseListItem
            key={index}
            exercise={exercise}
            index={index}
          />
        ))
      ) : (
        <View style={{ alignItems: "center", padding: 40 }}>
          <Ionicons name="barbell" color={theme.colors.text} size={50} />
          <ThemedText type="subtitle">Get Started</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ opacity: 0.6 }}>
            Add exercises to get started
          </ThemedText>
        </View>
      )}
    </>
  );
};

export default RoutineExerciseList;

const styles = StyleSheet.create({});
