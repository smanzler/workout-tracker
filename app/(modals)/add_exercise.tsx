import {
  Alert,
  Button,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Set } from "@/models/Set";
import { useTheme } from "@react-navigation/native";
import ExercisesList from "@/components/ExercisesList";
import { useAuth } from "@/providers/AuthProvider";

interface Section {
  title: string;
  data: Exercise[];
}

const groupData = (data: Exercise[], recentItems: Exercise[]): Section[] => {
  const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
  const sections: Record<string, Section> = {};

  sorted.forEach((item) => {
    const firstLetter = item.title[0].toUpperCase();
    if (!sections[firstLetter]) {
      sections[firstLetter] = { title: firstLetter, data: [] };
    }
    sections[firstLetter].data.push(item);
  });

  const groupedSections = Object.values(sections);

  if (recentItems.length > 0) {
    groupedSections.unshift({ title: "Recent", data: recentItems });
  }

  return groupedSections;
};

function Add_Exercise({ exercises }: { exercises: Exercise[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recent, setRecent] = useState<Exercise[]>([]);
  const [selectedItems, setSelectedItems] = useState<Exercise[]>([]);
  const { activeWorkoutId } = useWorkout();
  const theme = useTheme();
  const { user } = useAuth();

  const filteredData = exercises.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections: Section[] = groupData(filteredData, recent);

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
    await database.write(async () => {
      const workout = await workoutsCollection.find(activeWorkoutId);

      const existingWorkoutExercises = await workout.workoutExercises.fetch();

      let nextOrder = existingWorkoutExercises.length + 1;

      const batchOps = selectedItems.flatMap((exercise) => {
        const workoutExercise = workoutExercisesCollection.prepareCreate(
          (workoutExercise) => {
            // @ts-ignore
            workoutExercise.exercise.set(exercise);
            // @ts-ignore
            workoutExercise.workout.set(workout);
            workoutExercise.order = nextOrder++;
            user && (workoutExercise.userId = user.id);
          }
        );

        const set = setsCollection.prepareCreate((set) => {
          // @ts-ignore
          set.workoutExercise.set(workoutExercise);
          set.order = 1;
          set.reps = undefined;
          set.weight = undefined;
          user && (set.userId = user.id);
        });

        return [workoutExercise, set];
      });

      await database.batch(...batchOps);
    });

    router.back();

    setRecent((prev) => {
      const updatedRecent = [
        ...selectedItems,
        ...prev.filter((i) => !selectedItems.some((s) => s.id === i.id)),
      ].slice(0, 5);
      return updatedRecent;
    });

    setSelectedItems([]);
  };

  const handleAddItem = () => {
    Alert.prompt(
      "Add Exercise",
      "Enter the name of the new exercise:",
      async (name) => {
        if (name) {
          try {
            await database.write(async () => {
              await exercisesCollection.create((exercise) => {
                exercise.title = name;
                user && (exercise.userId = user.id);
              });
            });
          } catch (error) {
            console.error("Failed to add exercise:", error);
          }
        }
      }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
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

      <View style={{ padding: 20 }}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.colors.card, color: theme.colors.text },
          ]}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <Button title="Add Item" onPress={handleAddItem} />
      </View>

      <ExercisesList
        sections={sections}
        renderItem={({ item }: { item: Exercise }) => (
          <TouchableOpacity onPress={() => handleItemPress(item)}>
            <View
              style={[
                styles.item,
                selectedItems.some((i) => i.id === item.id) && {
                  backgroundColor: theme.colors.primary
                    .replace("rgb", "rgba")
                    .replace(")", ", 0.2)"),
                },
                { borderBottomColor: theme.colors.border },
              ]}
            >
              <Text style={{ color: theme.colors.text }}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const enhance = withObservables([], () => ({
  exercises: exercisesCollection.query(),
}));

export default enhance(Add_Exercise);

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
});
