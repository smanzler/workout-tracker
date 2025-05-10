import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { workoutsCollection, setsCollection } from "@/db";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Workout } from "@/models/Workout";
import { Ionicons } from "@expo/vector-icons";
import PostWorkoutSummary, {
  PostWorkout,
} from "@/components/PostWorkoutSummary";
import { Q } from "@nozbe/watermelondb";
import { BodyScrollView } from "@/components/BodyScrollView";
import { CelebrationAnimation } from "@/components/CelebrationAnimation";

const Summary = () => {
  const theme = useTheme();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [workoutData, setWorkoutData] = useState<PostWorkout>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWorkoutData = async () => {
      try {
        if (!workoutId) {
          setError("No workout found");
          return;
        }

        const workout = await workoutsCollection.find(workoutId);
        const workoutExercises = await workout.workoutExercises.fetch();

        const exercises = await Promise.all(
          workoutExercises.map(async (we) => {
            const exercise = await we.exercise;
            const sets = await setsCollection
              .query(Q.where("workout_exercise_id", we.id))
              .fetch();

            return {
              exercise_title: exercise.title,
              sets: sets.map((set) => ({
                reps: set.reps,
                weight: set.weight,
                is_1rm_pr: set.is1RMPr,
                is_volume_pr: set.isVolumePr,
                is_weight_pr: set.isWeightPr,
              })),
            };
          })
        );

        setWorkoutData({
          workout_id: workout.id,
          workout_name: workout.name,
          start_time: workout.startTime.toString(),
          end_time: workout.endTime ? workout.endTime.toString() : "",
          exercises,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workout");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkoutData();
  }, [workoutId]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Congratulations!",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <BodyScrollView style={{ padding: 20 }}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(modals)/workout_modal",
              params: { workoutId },
            })
          }
          style={styles.summaryContainer}
        >
          {workoutData && <PostWorkoutSummary workout={workoutData} />}
        </TouchableOpacity>
      </BodyScrollView>
      <CelebrationAnimation />
    </>
  );
};

export default Summary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  summaryContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
});
