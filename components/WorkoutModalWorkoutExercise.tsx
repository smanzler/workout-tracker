import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { ThemedText } from "./ThemedText";
import { Exercise } from "@/models/Exercise";
import { Set } from "@/models/Set";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import Animated, { FadeIn, Layout } from "react-native-reanimated";

const WorkoutModalWorkoutExercise = ({
  workoutExercise,
  setSetsLoading,
}: {
  workoutExercise: WorkoutExercise;
  setSetsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<Set[] | null>(null);
  const [loading, setLoading] = useState(true);

  const { colors } = useTheme();

  useEffect(() => {
    const fetchExerciseAndSets = async () => {
      if (!workoutExercise) return;
      setSetsLoading(true);
      setLoading(true);

      try {
        const [exerciseData, setsData] = await Promise.all([
          workoutExercise.exercise,
          workoutExercise.sets.fetch(),
        ]);

        setExercise(exerciseData);
        setSets(setsData);
      } catch (error) {
        console.error("Error fetching exercise data:", error);
      } finally {
        setLoading(false);
        setSetsLoading(false);
      }
    };

    fetchExerciseAndSets();
  }, [workoutExercise]);

  if (loading || !exercise || !sets) {
    return (
      <View style={[styles.container, { borderColor: colors.border }]}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }

  const calculateVolume = (set: Set) => {
    if (!set.weight || !set.reps) return 0;
    return set.weight * set.reps;
  };

  const totalVolume = sets.reduce((acc, set) => acc + calculateVolume(set), 0);
  const totalPRs = sets.reduce(
    (acc, set) =>
      acc +
      (set.isWeightPr ? 1 : 0) +
      (set.isVolumePr ? 1 : 0) +
      (set.is1RMPr ? 1 : 0),
    0
  );

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <ThemedText type="defaultSemiBold" style={styles.exerciseTitle}>
            {exercise.title}
          </ThemedText>
          {totalPRs > 0 && (
            <View style={[styles.prBadge]}>
              <MaterialCommunityIcons name="trophy" color="#FFD700" size={12} />
              <ThemedText style={styles.prText}>
                {totalPRs} PR{totalPRs > 1 ? "s" : ""}
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons
              name="barbell-outline"
              size={16}
              color={colors.text}
              style={{ opacity: 0.7 }}
            />
            <ThemedText style={{ opacity: 0.7 }}>
              {totalVolume} lb total
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons
              name="repeat-outline"
              size={16}
              color={colors.text}
              style={{ opacity: 0.7 }}
            />
            <ThemedText style={{ opacity: 0.7 }}>{sets.length} sets</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.setsContainer}>
        {sets.map((s, index) => (
          <View
            key={index}
            style={[
              styles.setRow,
              { borderBottomColor: colors.border },
              index === sets.length - 1 && styles.lastSetRow,
            ]}
          >
            <View style={styles.setInfo}>
              <View style={styles.setNumber}>
                <ThemedText style={styles.setNumberText}>
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText style={styles.setText}>
                {s.weight} lb × {s.reps}
              </ThemedText>
            </View>

            <View style={styles.prContainer}>
              {s.isWeightPr && (
                <View style={[styles.prTag]}>
                  <MaterialCommunityIcons
                    name="trophy"
                    color="#FFD700"
                    size={10}
                  />
                  <ThemedText style={styles.prTagText}>W</ThemedText>
                </View>
              )}
              {s.isVolumePr && (
                <View style={[styles.prTag]}>
                  <MaterialCommunityIcons
                    name="trophy"
                    color="#FFD700"
                    size={10}
                  />
                  <ThemedText style={styles.prTagText}>V</ThemedText>
                </View>
              )}
              {s.is1RMPr && (
                <View style={[styles.prTag]}>
                  <MaterialCommunityIcons
                    name="trophy"
                    color="#FFD700"
                    size={10}
                  />
                  <ThemedText style={styles.prTagText}>1RM</ThemedText>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default WorkoutModalWorkoutExercise;

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    padding: 12,
  },
  headerContainer: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  exerciseTitle: {
    fontSize: 16,
  },
  prBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  prText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastSetRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  setInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  setNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  setNumberText: {
    fontSize: 12,
    fontWeight: "600",
  },
  setText: {
    fontSize: 15,
  },
  prContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  prTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FFD700",
    gap: 2,
  },
  prTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
