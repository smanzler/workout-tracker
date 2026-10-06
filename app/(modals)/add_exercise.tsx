import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Exercise } from "@/models/Exercise";
import { withObservables } from "@nozbe/watermelondb/react";
import database, {
  exercisesCollection,
  setsCollection,
  workoutExercisesCollection,
  workoutsCollection,
} from "@/db";
import { router } from "expo-router";
import { useWorkout } from "@/providers/WorkoutProvider";
import { useTheme } from "expo-router/react-navigation";
import { useAuth } from "@/providers/AuthProvider";
import { ThemedText } from "@/components/ThemedText";
import ExerciseList from "@/components/ExerciseList";

function AddExercise() {
  const [selectedItems, setSelectedItems] = useState<Exercise[]>([]);
  const { activeWorkoutId } = useWorkout();
  const theme = useTheme();
  const { user } = useAuth();

  const handleItemPress = (item: Exercise) => {
    setSelectedItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleAddToWorkout = async () => {
    if (selectedItems.length === 0 || !activeWorkoutId) return;

    try {
      await database.write(async () => {
        const workout = await workoutsCollection.find(activeWorkoutId);

        const batchOps = selectedItems.flatMap((exercise) => {
          const workoutExercise = workoutExercisesCollection.prepareCreate(
            (workoutExercise) => {
              // @ts-ignore
              workoutExercise.exercise.set(exercise);
              // @ts-ignore
              workoutExercise.workout.set(workout);
              user && (workoutExercise.userId = user.id);
            }
          );

          const set = setsCollection.prepareCreate((set) => {
            // @ts-ignore
            set.workoutExercise.set(workoutExercise);
            set.reps = undefined;
            set.weight = undefined;
            set.position = 1;
            user && (set.userId = user.id);
          });

          return [workoutExercise, set];
        });

        await database.batch(...batchOps);
      });

      router.back();

      setSelectedItems([]);
    } catch (error) {
      console.error("Failed to add exercises to workout:", error);
      Alert.alert(
        "Error",
        "Failed to add exercises to workout. Please try again."
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ExerciseList
        onPress={handleItemPress}
        selectedItems={selectedItems}
        topBar={
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={handleAddToWorkout}
              disabled={selectedItems.length === 0}
            >
              <Text
                style={[
                  styles.addButton,
                  selectedItems.length === 0 && styles.disabled,
                ]}
              >
                Add to Workout ({selectedItems.length})
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

export default AddExercise;

const styles = StyleSheet.create({
  topBar: {
    padding: 15,
  },
  addButton: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "600",
  },
  disabled: {
    color: "#ccc",
  },
  input: {
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  item: {
    padding: 10,
    paddingLeft: 20,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
  },
  mgText: {
    fontWeight: 600,
    opacity: 0.6,
  },
});
