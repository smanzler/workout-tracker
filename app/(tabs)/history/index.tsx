import { StyleSheet } from "react-native";
import React from "react";
import WorkoutList from "@/components/WorkoutList";
import { BodyScrollView } from "@/components/BodyScrollView";
import { withObservables } from "@nozbe/watermelondb/react";
import { workoutsCollection } from "@/db";
import { Workout } from "@/models/Workout";
import { Q } from "@nozbe/watermelondb";
import { EmptyState } from "@/components/EmptyState";
import { router } from "expo-router";

const History = ({ workouts }: { workouts: Workout[] }) => {
  return workouts.length !== 0 ? (
    <BodyScrollView style={{ paddingHorizontal: 20 }}>
      <WorkoutList workouts={workouts} />
    </BodyScrollView>
  ) : (
    <EmptyState
      icon="globe-outline"
      title="No Workouts Yet"
      description="Start your fitness journey by starting your first workout!"
      buttonText="Start Workout"
      buttonIcon="barbell"
      onButtonPress={() => router.navigate("/(tabs)/start_workout")}
    />
  );
};

const enhance = withObservables([], () => ({
  workouts: workoutsCollection
    .query(Q.where("end_time", Q.notEq(null)), Q.sortBy("start_time", Q.desc))
    .observeWithColumns(["start_time"]),
}));

export default enhance(History);

const styles = StyleSheet.create({});
