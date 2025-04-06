import { StyleSheet, View } from "react-native";
import React from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "./ThemedText";
import { RoutineExercise } from "@/models/RoutineExercise";
import RoutineExerciseListItem from "./RoutineExerciseListItem";

const RoutineExerciseList = ({
  routineExercises,
}: {
  routineExercises: RoutineExercise[];
}) => {
  const theme = useTheme();
  return (
    <>
      {routineExercises?.length ? (
        routineExercises.map((routineExercise) => (
          <RoutineExerciseListItem
            key={routineExercise.id}
            routineExercise={routineExercise}
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

const enhance = withObservables(["routine"], ({ routine }) => ({
  routineExercises: routine.routineExercises,
}));

export default enhance(RoutineExerciseList);

const styles = StyleSheet.create({});
