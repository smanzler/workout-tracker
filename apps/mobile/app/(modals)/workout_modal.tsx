import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Workout } from "@/models/Workout";
import { useTheme } from "expo-router/react-navigation";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { workoutsCollection } from "@/db";
import dayjs from "dayjs";
import { Set } from "@/models/Set";
import WorkoutModalWorkoutExercise from "@/components/WorkoutModalWorkoutExercise";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { formatDuration } from "@/utils/format";
import ButtonWithIcon from "@/components/ButtonWithIcon";
import { ScrollView } from "react-native-gesture-handler";
import { BodyScrollView } from "@/components/BodyScrollView";
const WorkoutModal = () => {
  const { colors } = useTheme();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    [],
  );

  useEffect(() => {
    const loadWorkout = async () => {
      if (!workoutId) return;

      const w = await workoutsCollection.find(workoutId);
      setWorkout(w);

      const wExercises = await w.workoutExercises.fetch();
      setWorkoutExercises(wExercises);

      const allSetsMap: Record<string, Set[]> = {};
      let volume = 0;
      let prCount = 0;

      for (const we of wExercises) {
        const sets = await we.sets.fetch();
        allSetsMap[we.id] = sets;

        for (const set of sets) {
          if (set.weight != null && set.reps != null) {
            volume += set.weight * set.reps;
          }

          prCount +=
            (set.isWeightPr ? 1 : 0) +
            (set.isVolumePr ? 1 : 0) +
            (set.is1RMPr ? 1 : 0);
        }
      }
    };

    loadWorkout();
  }, [workoutId]);

  return (
    <BodyScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
      }}
    >
      <Stack.Screen
        options={{
          headerTitle: workout?.name,
          headerRight: () => (
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  backgroundColor: String(colors.text)
                    .replace("rgb", "rgba")
                    .replace(")", ", 0.1)"),
                },
              ]}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      {workoutExercises.map((we) => (
        <WorkoutModalWorkoutExercise key={we.id} workoutExercise={we} />
      ))}
    </BodyScrollView>
  );
};

export default WorkoutModal;

const styles = StyleSheet.create({
  closeButton: {
    padding: 6,
    borderRadius: 100,
  },
});
