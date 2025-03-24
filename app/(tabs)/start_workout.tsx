import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { useWorkout } from "@/providers/WorkoutProvider";
import database, { workoutsCollection } from "@/db";
import { useTheme } from "@react-navigation/native";

export default function StartWorkoutScreen() {
  const { activeWorkoutId, startWorkout } = useWorkout();
  const theme = useTheme();

  const handleDelete = async () => {
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
  };

  const start = () => {
    if (activeWorkoutId) {
      Alert.alert(
        "Active Workout",
        "You already have an active workout. Starting a new workout will override the current one. Do you want to continue?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Resume Workout",
            onPress: () => {
              router.push("/(modals)/workout");
            },
          },
          {
            text: "Start New Workout",
            onPress: async () => {
              await handleDelete();

              await startWorkout();
              router.push("/(modals)/workout");
            },
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    } else {
      startWorkout();
      router.push("/(modals)/workout");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={[styles.headerText, { color: theme.colors.text }]}>
          Start Workout
        </Text>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.colors.primary }]}
          onPress={start}
        >
          <Text style={[styles.btnText]}>Start Workout</Text>
        </TouchableOpacity>

        <View style={styles.templateHeader}>
          <Text style={[styles.headerText, { color: theme.colors.text }]}>
            Templates
          </Text>
          <TouchableOpacity
            style={[
              styles.templateBtn,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <View style={{ flexDirection: "row" }}>
              <Text style={[styles.templateBtnText]}>Template</Text>
              <Entypo name="plus" size={16} color={"#e5e5e7"} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 40,
  },
  templateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  templateBtn: {
    padding: 10,
    borderRadius: 8,
  },
  templateBtnText: {
    fontWeight: "bold",
    color: "#e5e5e7",
  },
  btn: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 50,
  },
  btnText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#e5e5e7",
  },
});
