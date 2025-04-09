import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Exercise } from "@/models/Exercise";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { exercisesCollection } from "@/db";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

const ExerciseHistory = () => {
  const { exerciseId, title } = useLocalSearchParams<{
    exerciseId: string;
    title: string;
  }>();
  const [exercise, setExercise] = useState<Exercise | undefined>(undefined);
  const [workoutExercises, setWorkoutExercises] = useState<
    WorkoutExercise[] | undefined
  >(undefined);
  const { colors } = useTheme();

  useEffect(() => {
    const load = async () => {
      if (!exerciseId) return;
      const e = await exercisesCollection.find(exerciseId);
      setExercise(e);

      const we = await e.workoutExercises.fetch();
      setWorkoutExercises(we);
    };
    load();
  }, [exerciseId]);

  return (
    <View>
      <Stack.Screen
        options={{
          headerTitle: title,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <Text>ExerciseHistory</Text>
    </View>
  );
};

export default ExerciseHistory;

const styles = StyleSheet.create({});
