import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Exercise } from "@/models/Exercise";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { exercisesCollection } from "@/db";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import { ThemedText } from "@/components/ThemedText";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { getMaxPRBefore } from "@/utils/PRs";
import dayjs from "dayjs";
import ExerciseHistoryListItem from "@/components/ExerciseHistoryListItem";

type PRs = {
  weight: {
    value: number;
    date: number;
  };
  volume: {
    value: number;
    date: number;
  };
  oneRepMax: {
    value: number;
    date: number;
  };
};

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
  const [loading, setLoading] = useState(true);
  const [prs, setPrs] = useState<PRs>();

  const opacity = useSharedValue(0);

  useEffect(() => {
    const load = async () => {
      if (!exerciseId) return;

      setLoading(true);

      const e = await exercisesCollection.find(exerciseId);
      setExercise(e);

      const we = await e.workoutExercises.fetch();
      setWorkoutExercises(we);

      if (we.length === 0) return;

      const p = await getMaxPRBefore(new Date().getTime(), exerciseId);
      setPrs(p);

      setLoading(false);
    };
    load();
  }, [exerciseId]);

  useEffect(() => {
    if (!loading) {
      opacity.value = withTiming(1, { duration: 500 });
    }
  }, [loading]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <BodyScrollView style={{ paddingHorizontal: 20 }} stickyHeaderIndices={[1]}>
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

      <Animated.View style={animatedStyle}>
        {workoutExercises && workoutExercises?.length !== 0 ? (
          <>
            <ThemedText
              style={{
                fontSize: 20,
                fontWeight: 600,
                opacity: 0.6,
                marginBottom: 40,
              }}
            >
              {exercise?.muscleGroup}
            </ThemedText>

            <ThemedText type="subtitle" style={{ marginBottom: 10 }}>
              Personal Records
            </ThemedText>

            <View style={styles.prContainer}>
              <View style={[styles.prCard, { backgroundColor: colors.card }]}>
                <ThemedText
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.prSubText}
                >
                  Max Weight
                </ThemedText>

                <ThemedText
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.prWeightText}
                >
                  {prs?.weight?.value} lbs
                </ThemedText>

                <ThemedText
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.prSubText}
                >
                  {dayjs(prs?.weight?.date).format("[on] MMM D")}
                </ThemedText>
              </View>

              <View style={[styles.prCard, { backgroundColor: colors.card }]}>
                <ThemedText
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.prSubText}
                >
                  One Rep Max
                </ThemedText>

                <ThemedText
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.prWeightText}
                >
                  {Math.floor(prs?.oneRepMax?.value ?? 0)} lbs
                </ThemedText>

                <ThemedText
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.prSubText}
                >
                  {dayjs(prs?.oneRepMax?.date).format("[on] MMM D")}
                </ThemedText>
              </View>

              <View style={[styles.prCard, { backgroundColor: colors.card }]}>
                <ThemedText
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.prSubText}
                >
                  Max Volume
                </ThemedText>

                <ThemedText
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.prWeightText}
                >
                  {prs?.volume?.value} lbs
                </ThemedText>

                <ThemedText
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.prSubText}
                >
                  {dayjs(prs?.volume?.date).format("[on] MMM D")}
                </ThemedText>
              </View>
            </View>

            <ThemedText type="subtitle" style={{ marginBottom: 10 }}>
              History
            </ThemedText>

            {workoutExercises.map((workoutExercise) => (
              <ExerciseHistoryListItem
                key={workoutExercise.id}
                workoutExercise={workoutExercise}
              />
            ))}
          </>
        ) : (
          <View style={{ alignItems: "center", padding: 40, marginTop: 100 }}>
            <Ionicons name="barbell" color={colors.text} size={50} />
            <ThemedText type="subtitle">No History</ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={{ opacity: 0.6, textAlign: "center" }}
            >
              Your PRs and Hisory will appear here when you use the exercise
            </ThemedText>
          </View>
        )}
      </Animated.View>
    </BodyScrollView>
  );
};

export default ExerciseHistory;

const styles = StyleSheet.create({
  prContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  prCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    width: "32%",
  },
  prSubText: {
    fontSize: 16,
    fontWeight: 600,
    opacity: 0.6,
  },
  prWeightText: {
    fontSize: 18,
    fontWeight: 600,
  },
});
