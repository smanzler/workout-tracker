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
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useWorkout } from "@/providers/workout-provider";
import { router, Stack } from "expo-router";
import database, { workoutsCollection } from "@/db";
import { Workout as WorkoutModel } from "@/db/models/workout";
import WorkoutExerciseList from "../components/workout-exercise-list";
import { useTheme } from "expo-router/react-navigation";
import Button from "@/components/button";
import { checkPRs } from "@/features/activity/lib/personal-records";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";

const Workout = () => {
  const { seconds, activeWorkoutId, stopWorkout, isLoading } = useWorkout();
  const [workout, setWorkout] = useState<WorkoutModel | undefined>(undefined);
  const [workoutName, setWorkoutName] = useState<string>("");
  const { colors } = useTheme();
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
        "0",
      )}:${String(seconds).padStart(2, "0")}`;
    } else {
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0",
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
              router.replace("/(tabs)/start-workout");
            },
            style: "destructive",
          },
        ],
      );
      return;
    }

    const allSetsComplete = await Promise.all(
      workoutExercises.map(async (we) => {
        const sets = await we.sets.fetch();
        return sets.every((set) => set.completed);
      }),
    );

    if (!allSetsComplete.every((complete) => complete)) {
      alert("Please complete all sets before finishing the workout.");
      return;
    }

    router.replace({
      pathname: "/(modals)/summary",
      params: { workoutId: workout.id },
    });

    try {
      await checkPRs(workout, workoutExercises);

      await stopWorkout(workoutName);
    } catch (error) {
      console.error("Failed to finish workout:", error);
      Alert.alert(
        "Error",
        `Failed to finish workout. Please try again. ${error}`,
      );
    }
  };

  const cancelWorkout = async () => {
    router.back();

    if (!activeWorkoutId) return;

    try {
      const workout = await workoutsCollection.find(activeWorkoutId);
      const workoutExercises = await workout.workoutExercises.fetch();

      database.write(async () => {
        const setsToDelete = await Promise.all(
          workoutExercises.map((we) => we.sets.fetch()),
        );

        const workoutExerciseDeletions = await Promise.all(
          workoutExercises.map((we) => we.markAsDeleted()),
        );
        const setDeletions = await Promise.all(
          setsToDelete.flat().map((set) => set.markAsDeleted()),
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
      ],
    );
  };

  return (
    <KeyboardAwareScrollView
      bottomOffset={100}
      style={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen
        options={{
          headerTitle: formatTime(seconds),
          headerRight: () => <RNButton title="Finish" onPress={finish} />,
        }}
      />
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
        placeholderTextColor={String(colors.text)
          .replace("rgb", "rgba")
          .replace(")", ", 0.4)")}
      />

      {workout && (
        <WorkoutExerciseList workout={workout} inputRefs={inputRefs} />
      )}

      <Button
        onPress={() => {
          router.push("/(modals)/add-exercise");
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
    </KeyboardAwareScrollView>
  );
};

export default Workout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
