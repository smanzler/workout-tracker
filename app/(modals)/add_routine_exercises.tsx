import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Exercise } from "@/models/Exercise";
import { router, Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { useRoutineActions } from "@/stores/routineStore";
import ExerciseList from "@/components/ExerciseList";

function AddRoutineExercises() {
  const [selectedItems, setSelectedItems] = useState<Exercise[]>([]);
  const theme = useTheme();
  const { addExercises } = useRoutineActions();

  const handleItemPress = (item: Exercise) => {
    setSelectedItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleAddToRoutine = async () => {
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
              onPress={handleAddToRoutine}
              disabled={selectedItems.length === 0}
            >
              <Text
                style={[
                  styles.addButton,
                  selectedItems.length === 0 && styles.disabled,
                ]}
              >
                Add to Routine ({selectedItems.length})
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

export default AddRoutineExercises;

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
