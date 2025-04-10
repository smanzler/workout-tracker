import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Set } from "@/models/Set";
import { withObservables } from "@nozbe/watermelondb/react";
import { useTheme } from "@react-navigation/native";
import { Workout } from "@/models/Workout";
import { ThemedText } from "./ThemedText";
import dayjs from "dayjs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ExerciseHistoryListItem = ({
  workoutExercise,
  workout,
  sets,
}: {
  workoutExercise: WorkoutExercise;
  workout: Workout;
  sets: Set[];
}) => {
  const { colors } = useTheme();

  const countPRs = (sets: Set[]) => {
    let prCount = 0;

    sets.forEach((set) => {
      if (set.isWeightPr) prCount++;
      if (set.is1RMPr) prCount++;
      if (set.isVolumePr) prCount++;
    });

    if (prCount === 1) {
      return "1 PR";
    } else {
      return `${prCount} PRs`;
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <ThemedText style={{ fontSize: 18, fontWeight: 600 }}>
        {workout.name || "Workout"}
      </ThemedText>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <ThemedText style={{ fontSize: 16, fontWeight: 600, opacity: 0.6 }}>
          {dayjs(workout.startTime).format("MMM D, YYYY")}
        </ThemedText>

        <View style={styles.textWithIcon}>
          <MaterialCommunityIcons
            style={{ opacity: 0.6 }}
            name="trophy"
            color={colors.text}
            size={16}
          />
          <ThemedText style={{ fontSize: 16, fontWeight: 600, opacity: 0.6 }}>
            {countPRs(sets)}
          </ThemedText>
        </View>
      </View>

      {sets.map((set) => (
        <View style={[styles.textWithIcon]}>
          <ThemedText style={{ fontWeight: 600 }} key={set.id}>
            {set.weight} lbs × {set.reps}
          </ThemedText>
          {(set.isWeightPr || set.is1RMPr || set.isVolumePr) && (
            <MaterialCommunityIcons name="trophy" color={"#e3c254"} size={16} />
          )}
        </View>
      ))}
    </View>
  );
};

const enhance = withObservables(
  ["workoutExercise"],
  ({ workoutExercise }: { workoutExercise: WorkoutExercise }) => ({
    workoutExercise,
    workout: workoutExercise.workout,
    sets: workoutExercise.sets,
  })
);

export default enhance(ExerciseHistoryListItem);

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  textWithIcon: {
    flexDirection: "row",
    gap: 5,
    alignItems: "baseline",
  },
});
