import {
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Button as RNButton,
} from "react-native";
import { of as of$ } from "rxjs";
import React, { useEffect, useState } from "react";
import { Workout } from "@/models/Workout";
import { BlurView } from "expo-blur";
import { useTheme } from "@react-navigation/native";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { router, useLocalSearchParams } from "expo-router";
import { workoutsCollection } from "@/db";
import dayjs from "dayjs";
import { Set } from "@/models/Set";
import WorkoutModalWorkoutExercise from "@/components/WorkoutModalWorkoutExercise";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const WorkoutModal = () => {
  const { colors } = useTheme();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    []
  );
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalPRCount, setTotalPRCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [setsLoading, setSetsLoading] = useState(true);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const loadWorkout = async () => {
      if (!workoutId) return;

      setLoading(true);

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

      setTotalVolume(volume);
      setTotalPRCount(prCount);

      setLoading(false);
    };

    loadWorkout();
  }, [workoutId]);

  function formatWorkoutDuration(startTime: number, endTime: number): string {
    const durationInSeconds = Math.floor(
      ((endTime ?? startTime) - startTime) / 1000
    );

    if (durationInSeconds < 60) {
      return `${durationInSeconds}s`;
    }

    const minutes = Math.floor(durationInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }

    return `${minutes}m`;
  }

  useEffect(() => {
    if (!loading && !setsLoading) {
      opacity.value = withTiming(1, { duration: 500 });
    }
  }, [loading, setsLoading]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={() => router.back()}>
        <BlurView intensity={40} style={styles.blurView} />
      </TouchableWithoutFeedback>

      {workout && (
        <Animated.View
          style={[styles.card, { backgroundColor: colors.card }, animatedStyle]}
        >
          <View style={styles.headerContainer}>
            <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
              Workout
            </ThemedText>

            <Button
              style={{
                height: 26,
                paddingHorizontal: 10,
                backgroundColor: colors.text
                  .replace("rgb", "rgba")
                  .replace(")", ", 0.1)"),
              }}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Button>
          </View>

          <ThemedText style={{ fontSize: 16, fontWeight: "600", opacity: 0.6 }}>
            {dayjs(workout.startTime).format("h:mm a, dddd, MMM D YYYY")}
          </ThemedText>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginVertical: 10,
              opacity: 0.6,
            }}
          >
            <View style={[styles.item]}>
              <MaterialCommunityIcons
                name="clock-time-five"
                color={colors.text}
                size={18}
              />
              <Text style={[styles.itemText, { color: colors.text }]}>
                {workout.startTime && workout.endTime
                  ? formatWorkoutDuration(workout.startTime, workout.endTime)
                  : "—"}
              </Text>
            </View>
            <View style={[styles.item]}>
              <MaterialCommunityIcons
                name="weight"
                color={colors.text}
                size={18}
              />
              <Text style={[styles.itemText, { color: colors.text }]}>
                {totalVolume} lb
              </Text>
            </View>
            <View style={[styles.item]}>
              <MaterialCommunityIcons
                name="trophy"
                color={colors.text}
                size={18}
              />
              <Text style={[styles.itemText, { color: colors.text }]}>
                {totalPRCount} PRs
              </Text>
            </View>
          </View>
          {workoutExercises.map((we) => (
            <WorkoutModalWorkoutExercise
              workoutExercise={we}
              setSetsLoading={setSetsLoading}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
};

export default WorkoutModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blurView: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    width: "90%",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  item: {
    flexDirection: "row",
    gap: 5,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
