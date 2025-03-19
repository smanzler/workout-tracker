import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useWorkout } from "@/providers/WorkoutProvider";
import { router } from "expo-router";
import database from "@/db";
import { Workout as WorkoutModel } from "@/models/Workout";
import WorkoutExerciseList from "@/components/WorkoutExerciseList";

const Workout = () => {
  const { seconds, activeWorkoutId, stopWorkout } = useWorkout();
  const [workout, setWorkout] = useState<WorkoutModel | undefined>(undefined);

  useEffect(() => {
    async function fetchWorkout() {
      if (activeWorkoutId) {
        const workout = await database
          .get<WorkoutModel>("workouts")
          .find(activeWorkoutId);

        setWorkout(workout);
      }
    }

    fetchWorkout();
  }, [activeWorkoutId]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    } else {
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.header}>Workout</Text>

        <Text
          style={{
            textAlign: "center",
            position: "absolute",
            left: 0,
            right: 0,
          }}
        >
          {formatTime(seconds)}
        </Text>

        <TouchableOpacity style={styles.btn} onPress={stopWorkout}>
          <Text style={{ color: "white" }}>stop</Text>
        </TouchableOpacity>
      </View>

      {workout && <WorkoutExerciseList workout={workout} />}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => {
          router.push("/(modals)/add_exercise");
        }}
      >
        <Text style={{ color: "white" }}>Add Exercises</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Workout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
  },
  btn: { backgroundColor: "#bf787d", padding: 5, borderRadius: 5 },
  addBtn: {
    backgroundColor: "#2ba0d6",
    width: 120,
    alignItems: "center",
    padding: 5,
    display: "flex",
    borderRadius: 5,
  },
});
