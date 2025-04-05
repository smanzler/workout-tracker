import { SafeAreaView, StyleSheet } from "react-native";
import React from "react";
import WorkoutList from "@/components/WorkoutList";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import { withObservables } from "@nozbe/watermelondb/react";
import { workoutsCollection } from "@/db";
import { Workout } from "@/models/Workout";
import { Q } from "@nozbe/watermelondb";
import { ThemedText } from "@/components/ThemedText";
import { View } from "react-native";
import Button from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";

const History = ({ workouts }: { workouts: Workout[] }) => {
  const theme = useTheme();

  return workouts.length !== 0 ? (
    <BodyScrollView style={{ paddingHorizontal: 20 }}>
      <WorkoutList workouts={workouts} />
    </BodyScrollView>
  ) : (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Ionicons
          style={{ alignSelf: "center" }}
          name="barbell"
          color={theme.colors.text}
          size={50}
        />
        <ThemedText type="subtitle" style={{ textAlign: "center" }}>
          No Workouts Yet
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.h2}>
          Start your fitness journey by starting your first workout!
        </ThemedText>
        <Button
          style={{ marginTop: 20 }}
          size="sm"
          onPress={() => router.navigate("/(tabs)/start_workout")}
        >
          Start Workout
        </Button>
      </View>
    </View>
  );
};

const enhance = withObservables([], () => ({
  workouts: workoutsCollection
    .query(Q.where("end_time", Q.notEq(null)), Q.sortBy("start_time", Q.desc))
    .observeWithColumns(["start_time"]),
}));

export default enhance(History);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    width: 220,
    flexDirection: "column",
    gap: 10,
  },
  h2: {
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 20,
  },
});
