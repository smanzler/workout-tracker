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
  routineExercisesCollection,
  routinesCollection,
  routineSetsCollection,
} from "@/db";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/providers/AuthProvider";
import { ThemedText } from "@/components/ThemedText";
import ExerciseModal from "@/components/ExerciseModal";
import { useRoutineActions } from "@/stores/routineStore";
import ExerciseList from "@/components/ExerciseList";

function AddRoutineExercises() {
  const [selectedItems, setSelectedItems] = useState<Exercise[]>([]);
  const theme = useTheme();
  const { user } = useAuth();
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
