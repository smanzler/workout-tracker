import {
  StyleSheet,
  Text,
  View,
  Button as RNButton,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import { ThemedText } from "@/components/ThemedText";
import RoutineExerciseList from "@/components/RoutineExerciseList";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Routine } from "@/models/Routine";
import database, { routinesCollection } from "@/db";
import Button from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

const AddRoutine = () => {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const { colors } = useTheme();
  const [routineName, setRoutineName] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      if (routineId) {
        console.log("routineId:", routineId);
        const r = await routinesCollection.find(routineId);
        setRoutine(r);
      }
    };

    load();
  }, [routineId]);

  const handleSave = async () => {
    if (!routine) {
      console.error("No routine to save");
      return;
    }

    try {
      await database.write(async () => {
        routine.update((r) => {
          r.name = routineName || "New Routine";
        });
      });
    } catch (error) {
      console.error("Failed to save routine:", error);
      return;
    }

    router.back();
  };

  const handleBack = () => {
    Alert.alert(
      "Discard Routine",
      "Are you sure you want to discard this routine?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Discard",
          onPress: handleDelete,
          style: "destructive",
        },
      ]
    );
  };

  const handleDelete = () => {
    if (!routine) {
      console.error("No routine to delete");
      return;
    }

    try {
      database.write(async () => {
        const routineExercises = await routine.routineExercises.fetch();

        const setsToDelete = await Promise.all(
          routineExercises.map((re) => re.routineSets.fetch())
        );

        const routineExerciseDeletions = await Promise.all(
          routineExercises.map((re) => re.markAsDeleted())
        );
        const routineSetDeletions = await Promise.all(
          setsToDelete.flat().map((set) => set.markAsDeleted())
        );
        const routineDeletion = await routine.markAsDeleted();

        const batchOps = [
          ...routineExerciseDeletions,
          ...routineSetDeletions,
          routineDeletion,
        ];

        await database.batch(...batchOps);

        router.back();
      });
    } catch (error) {
      console.error("Failed to delete workout:", error);
    }
  };

  return (
    <BodyScrollView style={{ paddingHorizontal: 20 }}>
      <Stack.Screen
        options={{
          headerRight: () => <RNButton title="Done" onPress={handleSave} />,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <TextInput
        style={{
          fontSize: 24,
          fontWeight: "600",
          color: colors.text,
          marginVertical: 20,
        }}
        value={routineName}
        onChangeText={setRoutineName}
        placeholder="Routine Name"
        placeholderTextColor={colors.text
          .replace("rgb", "rgba")
          .replace(")", ", 0.4)")}
      />

      {routine && <RoutineExerciseList routine={routine} />}

      <Button
        onPress={() => {
          router.push({
            pathname: "/(modals)/add_routine_exercises",
            params: { routineId },
          });
        }}
      >
        Add Exercises
      </Button>

      <View style={{ height: 50 }} />
    </BodyScrollView>
  );
};

export default AddRoutine;

const styles = StyleSheet.create({});
