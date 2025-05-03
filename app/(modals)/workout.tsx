import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Button as RNButton,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useWorkout } from "@/providers/WorkoutProvider";
import { router, Stack } from "expo-router";
import database, { workoutsCollection } from "@/db";
import { Workout as WorkoutModel } from "@/models/Workout";
import WorkoutExerciseList from "@/components/WorkoutExerciseList";
import { useTheme } from "@react-navigation/native";
import Button from "@/components/Button";
import { checkPRs } from "@/utils/PRs";
import { mySync } from "@/db/sync";
import { useAuth } from "@/providers/AuthProvider";
import { useSync } from "@/providers/SyncProvider";

const Workout = () => {
  const { seconds, activeWorkoutId, stopWorkout } = useWorkout();
  const [workout, setWorkout] = useState<WorkoutModel | undefined>(undefined);
  const [workoutName, setWorkoutName] = useState<string>("");
  const { colors } = useTheme();
  const { user } = useAuth();
  const { updateLastSync } = useSync();
  const inputRefs = useRef<(TextInput | null)[][]>([]);

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

    await checkPRs(workout, workoutExercises);

    await stopWorkout(workoutName);

    await mySync(user, updateLastSync, () => {});

    router.replace({
      pathname: "/(modals)/summary",
      params: { workoutId: workout.id },
    });
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
    router.back();
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          headerTitle: formatTime(seconds),
          headerRight: () => <RNButton title="Finish" onPress={finish} />,
        }}
      />

      <ScrollView style={{ paddingHorizontal: 20 }}>
        <TextInput
          style={{
            fontSize: 24,
            fontWeight: "600",
            color: colors.text,
            marginVertical: 20,
          }}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Workout Name"
          placeholderTextColor={colors.text
            .replace("rgb", "rgba")
            .replace(")", ", 0.4)")}
        />

        {workout && (
          <WorkoutExerciseList workout={workout} inputRefs={inputRefs} />
        )}

        <Button
          onPress={() => {
            router.push("/(modals)/add_exercise");
          }}
        >
          Add Exercises
        </Button>

        <Button
          style={{ marginTop: 10 }}
          variant="outline"
          onPress={handleCancel}
        >
          Cancel Workout
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Workout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  keyboardAccessory: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 44,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 10,
  },
});
