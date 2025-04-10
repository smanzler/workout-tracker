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
import { Entypo, Feather, Ionicons } from "@expo/vector-icons";
import { useWorkout } from "@/providers/WorkoutProvider";
import database, { routinesCollection, workoutsCollection } from "@/db";
import { useTheme } from "@react-navigation/native";
import Button from "@/components/Button";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import { ThemedText } from "@/components/ThemedText";
import { withObservables } from "@nozbe/watermelondb/react";
import { Routine } from "@/models/Routine";
import RoutineItem from "@/components/RoutineItem";
import { Q } from "@nozbe/watermelondb";
import { useRoutine } from "@/providers/RoutineProvider";

function StartWorkoutScreen({ routines }: { routines: Routine[] }) {
  const { activeWorkoutId, startWorkout } = useWorkout();
  const { colors } = useTheme();
  const { createRoutine } = useRoutine();

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
    await createRoutine();
    router.push("/(modals)/add_routine");
  };

  return (
    <BodyScrollView style={{ paddingHorizontal: 20 }}>
      <Button onPress={start} size="md">
        Start Workout
      </Button>

      <View style={styles.headerContainer}>
        <ThemedText type="title">Routines</ThemedText>

        <TouchableOpacity onPress={handleNewRoutine}>
          <Ionicons name="add" color={colors.primary} size={28} />
        </TouchableOpacity>
      </View>

      <View>
        {routines.length !== 0 ? (
          routines.map((r, i) => <RoutineItem key={i} routine={r} />)
        ) : (
          <View style={{ alignItems: "center", padding: 50, marginTop: 100 }}>
            <Ionicons name="create" color={colors.text} size={50} />
            <ThemedText type="subtitle">No Routines</ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={{ opacity: 0.6, textAlign: "center" }}
            >
              Your Routines will appear here when you create them.
            </ThemedText>
          </View>
        )}
      </View>
    </BodyScrollView>
  );
}

const enhance = withObservables([], () => ({
  routines: routinesCollection.query(Q.where("name", Q.notEq(null))),
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
