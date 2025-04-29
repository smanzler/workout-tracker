import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  SafeAreaView,
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
import { formatDuration } from "@/utils/format";
import ButtonWithIcon from "@/components/ButtonWithIcon";

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
      {workout && (
        <Animated.View style={[{ flex: 1, padding: 20 }, animatedStyle]}>
          <View style={styles.headerContainer}>
            <ThemedText type="title">{workout.name}</ThemedText>

            <ButtonWithIcon onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={colors.text} />
            </ButtonWithIcon>
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
                  ? formatDuration(workout.startTime, workout.endTime)
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

          <ScrollView
            style={styles.exerciseList}
            showsVerticalScrollIndicator={false}
          >
            {workoutExercises.map((we) => (
              <WorkoutModalWorkoutExercise
                key={we.id}
                workoutExercise={we}
                setSetsLoading={setSetsLoading}
              />
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default WorkoutModal;

const styles = StyleSheet.create({
  blurView: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    gap: 5,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  exerciseList: {
    flex: 1,
    marginTop: 10,
  },
});
