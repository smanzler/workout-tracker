import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Button as RNButton,
} from "react-native";
import { router } from "expo-router";
import { Entypo, Feather } from "@expo/vector-icons";
import { useWorkout } from "@/providers/WorkoutProvider";
import database, { routinesCollection, workoutsCollection } from "@/db";
import { useTheme } from "@react-navigation/native";
import Button from "@/components/Button";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import { ThemedText } from "@/components/ThemedText";
import { withObservables } from "@nozbe/watermelondb/react";
import { Routine } from "@/models/Routine";
import RoutineItem from "@/components/RoutineItem";

function StartWorkoutScreen({ routines }: { routines: Routine[] }) {
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

  const handleNewRoutine = async () => {
    console.log("Creating new routine...");
    try {
      database.write(async () => {
        const routine = await routinesCollection.create((r) => {
          r.name = "New Routine";
        });

        console.log("pushing to new routine modal with id:", routine.id);
        router.push({
          pathname: "/(modals)/add_routine",
          params: { routineId: routine.id },
        });
      });
    } catch (error) {
      console.log("Error creating new routine:", error);
    }
  };

  return (
    <BodyScrollView style={{ paddingHorizontal: 20 }}>
      <Button onPress={start} size="md">
        Start Workout
      </Button>

      <View style={styles.headerContainer}>
        <ThemedText type="title">Routines</ThemedText>

        <RNButton title="New" onPress={handleNewRoutine} />
      </View>

      <View>
        {routines.map((r, i) => (
          <RoutineItem key={i} routine={r} />
        ))}
      </View>
    </BodyScrollView>
  );
}

const enhance = withObservables([], () => ({
  routines: routinesCollection.query(),
}));

export default enhance(StartWorkoutScreen);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 60,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 40,
  },
});
