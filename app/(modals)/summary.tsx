import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  Share,
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
import SummaryHeader from "@/components/ui/SummaryHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Summary = () => {
  const theme = useTheme();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [workoutData, setWorkoutData] = useState<PostWorkout>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const { top } = useSafeAreaInsets();

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

  const formatDuration = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const handleShare = async () => {
    if (!workoutData) return;

    const duration =
      workoutData.end_time && workoutData.start_time
        ? formatDuration(
            new Date(workoutData.end_time).getTime() -
              new Date(workoutData.start_time).getTime()
          )
        : "0m";

    try {
      const message = `🏋️‍♂️ Just crushed a workout on Rep!\n\n🎯 ${workoutData.workout_name}\n⏱️ ${duration}\n💪 ${workoutData.exercises.length} exercises completed\n\nFeeling stronger every day! 💪`;

      await Share.share({
        message,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          presentation: "fullScreenModal",
          headerTransparent: true,
          header: () => <SummaryHeader handleShare={handleShare} />,
        }}
      />

      <BodyScrollView style={{ padding: 20, paddingTop: 120 }}>
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
