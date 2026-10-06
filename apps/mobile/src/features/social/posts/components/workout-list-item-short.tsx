import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { Workout } from "@/db/models/workout";
import { WorkoutExercise } from "@/db/models/workout-exercise";
import { useTheme } from "expo-router/react-navigation";
import { ThemedText } from "@/components/themed-text";
import dayjs from "dayjs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDuration } from "@/lib/format";
import { map, switchMap } from "rxjs/operators";
import { combineLatest } from "rxjs";
import { usePostActions } from "../stores/post-store";
import { router } from "expo-router";

const WorkoutListitemShort = ({
  workout,
  workoutExercises,
}: {
  workout: Workout;
  workoutExercises: WorkoutExercise[];
}) => {
  const { colors } = useTheme();
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const { setWorkout } = usePostActions();

  useEffect(() => {
    const fetchExerciseNames = async () => {
      const names = await Promise.all(
        workoutExercises.map(async (we) => {
          const exercise = await we.exercise;
          return exercise?.title ?? "Unknown";
        }),
      );

      setExerciseNames(names);
    };

    fetchExerciseNames();
  }, [workoutExercises]);

  const handlePress = () => {
    setWorkout(workout);

    router.back();
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.card,
        marginTop: 20,
        borderRadius: 12,
        padding: 12,
      }}
      onPress={handlePress}
    >
      <ThemedText type="defaultSemiBold">
        {workout.name || "New Workout"}
        <Text style={{ opacity: 0.6 }}>
          {" • "}
          {dayjs(workout.startTime).format("MMM D, YYYY")}
        </Text>
      </ThemedText>

      <View
        style={{
          flexDirection: "row",
          gap: 5,
          alignItems: "center",
          opacity: 0.6,
          marginVertical: 2,
        }}
      >
        <MaterialCommunityIcons
          name="clock-time-five"
          color={colors.text}
          size={18}
        />
        <ThemedText>
          {workout.endTime &&
            formatDuration(workout.startTime, workout.endTime)}
        </ThemedText>
      </View>

      <ThemedText style={{ opacity: 0.6 }}>
        {exerciseNames.join(", ")}
      </ThemedText>
    </TouchableOpacity>
  );
};

const enhance = withObservables(["workout"], ({ workout }) => ({
  workout,
  workoutExercises: workout.workoutExercises,
}));

export default enhance(WorkoutListitemShort);

const styles = StyleSheet.create({});
