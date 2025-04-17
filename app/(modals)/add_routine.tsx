import {
  StyleSheet,
  View,
  Button as RNButton,
  Alert,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import RoutineExerciseList from "@/components/RoutineExerciseList";
import { router, Stack } from "expo-router";
import database, {
  routineExercisesCollection,
  routinesCollection,
  routineSetsCollection,
} from "@/db";
import Button from "@/components/Button";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/providers/AuthProvider";
import { useRoutineActions, useRoutineExercises } from "@/stores/routineStore";

const AddRoutine = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [routineName, setRoutineName] = useState<string>("");
  const exercises = useRoutineExercises();
  const { clearRoutine } = useRoutineActions();

  const handleSave = async () => {
    if (exercises.length === 0) {
      Alert.alert("Add Exercises", "Add exercises to the routine to save it");
      return;
    }

    try {
      await database.write(async () => {
        const routine = await routinesCollection.create((r) => {
          r.name = routineName || "New Routine";
          if (user) r.userId = user.id;
        });

        const batchOps = exercises.flatMap((exercise) => {
          const routineExercise = routineExercisesCollection.prepareCreate(
            (routineExercise) => {
              // @ts-ignore
              routineExercise.exercise.set(exercise.exercise);
              // @ts-ignore
              routineExercise.routine.set(routine);
              if (user) routineExercise.userId = user.id;
            }
          );

          const sets = exercise.sets.map((s) =>
            routineSetsCollection.prepareCreate((set) => {
              // @ts-ignore
              set.routineExercise.set(routineExercise);
              set.reps = s.reps ? parseInt(s.reps) : undefined;
              set.weight = s.weight ? parseInt(s.weight) : undefined;
              if (user) set.userId = user.id;
            })
          );

          return [routineExercise, ...sets];
        });

        await database.batch(...batchOps);
      });
    } catch (error) {
      console.log("Error creating routine", error);
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
          onPress: async () => {
            clearRoutine();
            router.back();
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <BodyScrollView style={{ paddingHorizontal: 20 }}>
      <Stack.Screen
        options={{
          headerRight: () => <RNButton title="Cancel" onPress={handleBack} />,
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

      <RoutineExerciseList exercises={exercises} />

      <Button
        variant="outline"
        onPress={() => router.push("/(modals)/add_routine_exercises")}
      >
        Add Exercises
      </Button>

      <Button onPress={handleSave} style={{ marginTop: 10 }}>
        Save
      </Button>

      <View style={{ height: 50 }} />
    </BodyScrollView>
  );
};

export default AddRoutine;

const styles = StyleSheet.create({});
