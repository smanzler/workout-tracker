import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Workout } from "@/db/models/workout";
import { withObservables } from "@nozbe/watermelondb/react";
import { workoutsCollection } from "@/db";
import { Q } from "@nozbe/watermelondb";
import { ThemedText } from "@/components/themed-text";
import WorkoutListitemShort from "./workout-list-item-short";

const WorkoutListShort = ({ workouts }: { workouts: Workout[] }) => {
  return (
    <>
      {workouts.map((workout) => (
        <WorkoutListitemShort workout={workout} key={workout.id} />
      ))}
    </>
  );
};

const enhance = withObservables([], () => ({
  workouts: workoutsCollection
    .query(Q.where("end_time", Q.notEq(null)), Q.sortBy("start_time", Q.desc))
    .observeWithColumns(["start_time"]),
}));

export default enhance(WorkoutListShort);

const styles = StyleSheet.create({});
