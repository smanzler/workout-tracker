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
import React from "react";
import { useTheme } from "@react-navigation/native";
import { workoutsCollection } from "@/db";
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
import { withObservables } from "@nozbe/watermelondb/react";
import { Exercise } from "@/models/Exercise";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Set } from "@/models/Set";
import { Observable } from "rxjs";

interface SummaryProps {
  workout: Workout;
  workoutExercises: WorkoutExercise[];
  exercises: Exercise[];
  sets: Set[];
}

const Summary = ({
  workout,
  workoutExercises,
  exercises,
  sets,
}: SummaryProps) => {
  const formatDuration = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  // Transform the data for PostWorkoutSummary
  const workoutData: PostWorkout = {
    workout_id: workout.id,
    workout_name: workout.name,
    start_time: workout.startTime.toString(),
    end_time: workout.endTime ? workout.endTime.toString() : "",
    exercises: workoutExercises.map((we) => {
      const exercise = exercises.find((e) => e.id === we.exercise.id);
      const exerciseSets = sets.filter(
        (set) => set.workoutExercise.id === we.id
      );

      return {
        exercise_title: exercise?.title || "Loading...",
        sets: exerciseSets.map((set) => ({
          reps: set.reps,
          weight: set.weight,
          is_1rm_pr: set.is1RMPr,
          is_volume_pr: set.isVolumePr,
          is_weight_pr: set.isWeightPr,
        })),
      };
    }),
  };

  const handleShare = async () => {
    const duration =
      workout.endTime && workout.startTime
        ? formatDuration(
            new Date(workout.endTime).getTime() -
              new Date(workout.startTime).getTime()
          )
        : "0m";

    try {
      const message = `🏋️‍♂️ Just crushed a workout on Rep!\n\n🎯 ${workout.name}\n⏱️ ${duration}\n💪 ${workoutExercises.length} exercises completed\n\nFeeling stronger every day! 💪`;

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
              params: { workoutId: workout.id },
            })
          }
          style={styles.summaryContainer}
        >
          <PostWorkoutSummary workout={workoutData} />
        </TouchableOpacity>
      </BodyScrollView>
    </>
  );
};

// First enhance the workout
const enhanceWorkout = withObservables(
  ["workoutId"],
  ({ workoutId }: { workoutId: string }) => ({
    workout: workoutsCollection.findAndObserve(workoutId),
  })
);

// Then enhance with related data
const enhanceWithRelations = withObservables(
  ["workout"],
  ({ workout }: { workout: Workout }) => ({
    workout,
    workoutExercises: workout.workoutExercises.observe(),
    exercises: workout.collections.get<Exercise>("exercises").query().observe(),
    sets: workout.collections
      .get<Set>("sets")
      .query(Q.on("workout_exercises", "workout_id", workout.id))
      .observe(),
  })
);

// Compose the enhancements
const enhance = (component: React.ComponentType<SummaryProps>) =>
  enhanceWorkout(enhanceWithRelations(component));

const EnhancedSummary = enhance(Summary);

// Wrapper component to handle the workoutId from params
const SummaryWrapper = () => {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();

  if (!workoutId) {
    return null;
  }

  return <EnhancedSummary workoutId={workoutId} />;
};

export default SummaryWrapper;

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
