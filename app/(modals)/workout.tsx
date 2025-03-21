import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useWorkout } from "@/providers/WorkoutProvider";
import { router } from "expo-router";
import database, { workoutsCollection } from "@/db";
import { Workout as WorkoutModel } from "@/models/Workout";
import WorkoutExerciseList from "@/components/WorkoutExerciseList";
import { Feather } from "@expo/vector-icons";

const Workout = () => {
  const { seconds, activeWorkoutId, stopWorkout } = useWorkout();
  const [workout, setWorkout] = useState<WorkoutModel | undefined>(undefined);

  useEffect(() => {
    async function fetchWorkout() {
      if (activeWorkoutId) {
        const workout = await workoutsCollection.find(activeWorkoutId);

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

  const finish = async () => {
    if (!workout) return;

    const workoutExercises = await workout.workoutExercises.fetch();
    if (workoutExercises.length === 0) {
      Alert.alert(
        "Empty Workout",
        "This workout is empty. Would you like to delete it?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: async () => {
              await stopWorkout();
              await database.write(async () => {
                await workout.markAsDeleted();
              });
              router.replace("/(tabs)/start_workout");
            },
            style: "destructive",
          },
        ]
      );
      return;
    }
    const allSetsComplete = await Promise.all(
      workoutExercises.map(async (we) => {
        const sets = await we.sets.fetch();
        return sets.every((set) => set.completed);
      })
    );

    if (!allSetsComplete.every((complete) => complete)) {
      alert("Please complete all sets before finishing the workout.");
      return;
    }

    await stopWorkout();
    router.replace("/(tabs)/history");
  };

  const cancelWorkout = async () => {
    if (!activeWorkoutId) return;

    try {
      const workout = await workoutsCollection.find(activeWorkoutId);
      const workoutExercises = await workout.workoutExercises.fetch();

      database.write(async () => {
        const setsToDelete = await Promise.all(
          workoutExercises.map((we) => we.sets.fetch())
        );

        const workoutExerciseDeletions = await Promise.all(
          workoutExercises.map((we) => we.markAsDeleted())
        );
        const setDeletions = await Promise.all(
          setsToDelete.flat().map((set) => set.markAsDeleted())
        );
        const workoutDeletion = await workout.markAsDeleted();

        const batchOps = [
          ...workoutExerciseDeletions,
          ...setDeletions,
          workoutDeletion,
        ];

        await database.batch(...batchOps);
      });
    } catch (error) {
      console.error("Failed to delete workout:", error);
    }
    await stopWorkout();
    router.replace("/(tabs)/start_workout");
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to cancel this workout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: cancelWorkout,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
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

        <TouchableOpacity style={styles.btn} onPress={finish}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Finish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ paddingTop: 10 }}>
        {workout && <WorkoutExerciseList workout={workout} />}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            router.push("/(modals)/add_exercise");
          }}
        >
          <Feather name="plus" size={16} color="white" />
          <Text style={{ color: "white" }}>Add Exercises</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleCancel}>
          <Text style={{ color: "white" }}>Cancel Workout</Text>
        </TouchableOpacity>
      </ScrollView>
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
  btn: {
    backgroundColor: "#89ba7f",
    padding: 5,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  addBtn: {
    backgroundColor: "#2ba0d6",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: 5,
    padding: 5,
    display: "flex",
    borderRadius: 5,
  },
  deleteBtn: {
    backgroundColor: "#d66d6d",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: 5,
    padding: 5,
    display: "flex",
    borderRadius: 5,
    marginTop: 10,
  },
});
