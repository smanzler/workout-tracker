import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Exercise } from "@/models/Exercise";
import { Set } from "@/models/Set";
import SetListItem from "./SetListItem";
import { Entypo, FontAwesome5 } from "@expo/vector-icons";

const WorkoutExerciseListItem = ({
  workoutExercise,
  exercise,
  sets,
}: {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  sets: Set[];
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>{exercise.title}</Text>
      <View style={styles.setsHeader}>
        <Text
          style={[
            styles.setHeaderText,
            {
              width: 30,
              textAlign: "center",
            },
          ]}
        >
          Set
        </Text>
        <Text
          style={[styles.setHeaderText, { width: 80, textAlign: "center" }]}
        >
          Previous
        </Text>
        <View style={styles.rightContainer}>
          <Text
            style={[styles.setHeaderText, { width: 40, textAlign: "center" }]}
          >
            lbs
          </Text>
          <Text
            style={[styles.setHeaderText, { width: 40, textAlign: "center" }]}
          >
            Reps
          </Text>
          <View style={{ width: 30, alignItems: "center" }}>
            <FontAwesome5 name="check" size={16} color="black" />
          </View>
        </View>
      </View>
      {sets.map((set) => (
        <SetListItem key={set.id} set={set} />
      ))}
    </View>
  );
};

const enhance = withObservables(["workoutExercise"], ({ workoutExercise }) => ({
  workoutExercise,
  exercise: workoutExercise.exercise,
  sets: workoutExercise.sets,
}));

export default enhance(WorkoutExerciseListItem);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#d6d6d6",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  setsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 5,
  },
  rightContainer: {
    flexDirection: "row",
    gap: 10,
  },
  setHeaderText: {
    fontWeight: 500,
    fontSize: 16,
  },
});
