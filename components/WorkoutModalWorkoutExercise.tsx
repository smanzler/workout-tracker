import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { ThemedText } from "./ThemedText";
import { exercisesCollection } from "@/db";
import { Q } from "@nozbe/watermelondb";
import { Exercise } from "@/models/Exercise";
import { Set } from "@/models/Set";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

const WorkoutModalWorkoutExercise = ({
  workoutExercise,
  setSetsLoading,
}: {
  workoutExercise: WorkoutExercise;
  setSetsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<Set[] | null>(null);

  const theme = useTheme();

  useEffect(() => {
    const fetchExerciseAndSets = async () => {
      if (!workoutExercise) return;
      setSetsLoading(true);

      try {
        const exercise = await workoutExercise.exercise;
        setExercise(exercise);

        const sets = await workoutExercise.sets.fetch();
        setSets(sets);
      } catch (error) {
        console.log(error);
      } finally {
        setSetsLoading(false);
      }
    };

    fetchExerciseAndSets();
  }, [workoutExercise]);

  return (
    <>
      <View style={styles.row}>
        <ThemedText style={{ fontWeight: "bold", fontSize: 18 }}>
          {exercise && exercise.title}
        </ThemedText>

        <ThemedText style={{ fontWeight: "bold", fontSize: 18 }}>
          1RM
        </ThemedText>
      </View>
      {sets?.map((s, index) => (
        <View key={index} style={styles.row}>
          <View key={index} style={{ flexDirection: "row", gap: 5 }}>
            <ThemedText style={{ fontWeight: 500, opacity: 0.6 }}>
              {index + 1}
              {"   "}
              {s.weight} lb × {s.reps}
            </ThemedText>

            <View style={{ flexDirection: "row", gap: 5 }}>
              {s.isWeightPr && (
                <View style={styles.prContainer}>
                  <MaterialCommunityIcons
                    name="trophy"
                    color={theme.colors.text}
                    size={12}
                  />
                  <ThemedText style={{ fontSize: 12, fontWeight: "bold" }}>
                    Weight
                  </ThemedText>
                </View>
              )}
              {s.isVolumePr && (
                <View style={styles.prContainer}>
                  <MaterialCommunityIcons
                    name="trophy"
                    color={theme.colors.text}
                    size={12}
                  />
                  <ThemedText style={{ fontSize: 12, fontWeight: "bold" }}>
                    Volume
                  </ThemedText>
                </View>
              )}
              {s.is1RMPr && (
                <View style={styles.prContainer}>
                  <MaterialCommunityIcons
                    name="trophy"
                    color={theme.colors.text}
                    size={12}
                  />
                  <ThemedText style={{ fontSize: 12, fontWeight: "bold" }}>
                    1RM
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          <ThemedText style={{ fontWeight: "bold", opacity: 0.6 }}>
            {Math.floor((s.weight ?? 0) * (1 + (s.reps ?? 0) / 30))}
          </ThemedText>
        </View>
      ))}
    </>
  );
};

export default WorkoutModalWorkoutExercise;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  prContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
});
