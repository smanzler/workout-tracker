import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{exercise.title}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => {}}>
          <Entypo name="dots-three-horizontal" size={24} color="black" />
        </TouchableOpacity>
      </View>
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
        <SetListItem
          key={set.id}
          set={set}
          workoutExerciseId={workoutExercise.id}
        />
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  btn: {
    paddingHorizontal: 5,
    backgroundColor: "#e8e8e8",
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
