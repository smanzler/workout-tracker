import { StyleSheet, Text, View } from "react-native";
import dayjs from "dayjs";
import React from "react";
import { Workout } from "@/models/Workout";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import WorkoutExerciseTitle from "./WorkoutExerciseTitle";

const WorkoutListItem = ({
  workout,
  workoutExercises,
}: {
  workout: Workout;
  workoutExercises: WorkoutExercise[];
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Workout</Text>
      <Text style={styles.dateText}>
        {dayjs(workout.startTime).format("dddd, MMM D")}
      </Text>
      {workoutExercises.length !== 0 && (
        <>
          <Text style={styles.header2}>Exercises</Text>
          {workoutExercises.map((workoutExercise) => (
            <WorkoutExerciseTitle
              key={workoutExercise.id}
              workoutExercise={workoutExercise}
            />
          ))}
        </>
      )}
    </View>
  );
};

const enhance = withObservables(["workout"], ({ workout }) => ({
  workout,
  workoutExercises: workout.workoutExercises,
}));

export default enhance(WorkoutListItem);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#d6d6d6",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 500,
    color: "#4f4f4f",
    marginBottom: 7,
  },
  header2: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
