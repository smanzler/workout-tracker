import { StyleSheet, View } from "react-native";
import React from "react";
import { ThemedText } from "./ThemedText";
import { Exercise } from "@/models/Exercise";
import { Set } from "@/models/Set";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

const WorkoutExerciseItem = ({
  workoutName,
  exercise,
  sets,
}: {
  workoutName?: string;
  exercise: Exercise;
  sets: Set[];
}) => {
  const { colors } = useTheme();

  const totalPRs = sets.reduce(
    (acc, set) =>
      acc +
      (set.isWeightPr ? 1 : 0) +
      (set.isVolumePr ? 1 : 0) +
      (set.is1RMPr ? 1 : 0),
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.titleContainer}>
        <ThemedText type="defaultSemiBold" style={styles.exerciseTitle}>
          {workoutName ?? exercise.title}
        </ThemedText>
        {totalPRs > 0 && (
          <View style={[styles.prBadge]}>
            <MaterialCommunityIcons name="trophy" color="#FFD700" size={16} />
            <ThemedText type="defaultSemiBold">
              {totalPRs} PR{totalPRs > 1 ? "s" : ""}
            </ThemedText>
          </View>
        )}
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

export default WorkoutExerciseItem;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseTitle: {
    fontSize: 16,
  },
  prBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
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
