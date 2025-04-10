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
import { router, Stack } from "expo-router";
import { useWorkout } from "@/providers/WorkoutProvider";
import { useTheme } from "@react-navigation/native";
import ExercisesList from "@/components/ExercisesList";
import { useAuth } from "@/providers/AuthProvider";
import { ThemedText } from "@/components/ThemedText";
import ExerciseModal from "@/components/ExerciseModal";

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
  const [visible, setVisible] = useState(false);
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: "Search",
            onChangeText: (e) => {
              setSearchQuery(e.nativeEvent.text);
            },
          },
          headerRight: () => (
            <Button title="New" onPress={() => setVisible(true)} />
          ),
        }}
      />

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
              <ThemedText style={{ fontSize: 16, fontWeight: 600 }}>
                {item.title}
              </ThemedText>

              <View style={styles.row}>
                <ThemedText style={styles.mgText}>
                  {item.muscleGroup}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <ExerciseModal visible={visible} setVisible={setVisible} />
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
  row: {
    flexDirection: "row",
  },
  mgText: {
    fontWeight: 600,
    opacity: 0.6,
  },
});
