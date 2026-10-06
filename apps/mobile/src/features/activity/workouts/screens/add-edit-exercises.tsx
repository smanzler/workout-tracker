import React, {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import ExerciseList from "@/features/activity/components/exercise-list";
import { Exercise } from "@/db/models/exercise";
import { useWorkoutActions } from "../stores/workout-store";
import { useTheme } from "expo-router/react-navigation";
import { router, Stack } from "expo-router";
import { useState } from "react";

function AddEditExercises() {
  const [selectedItems, setSelectedItems] = useState<Exercise[]>([]);
  const theme = useTheme();
  const { addExercises } = useWorkoutActions();

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
    if (selectedItems.length === 0) {
      router.back();
      return;
    }

    addExercises(selectedItems);

    router.back();

    setSelectedItems([]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: "Add Exercises",
        }}
      />

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

export default AddEditExercises;

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
  mgText: {
    fontWeight: 600,
    opacity: 0.6,
  },
});
