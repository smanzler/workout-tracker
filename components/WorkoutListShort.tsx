import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Workout } from "@/models/Workout";
import { withObservables } from "@nozbe/watermelondb/react";
import { workoutsCollection } from "@/db";
import { Q } from "@nozbe/watermelondb";
import { ThemedText } from "./ThemedText";
import WorkoutListitemShort from "./WorkoutListitemShort";

const WorkoutListShort = ({ workouts }: { workouts: Workout[] }) => {
  return (
    <>
      {workouts.map((workout) => (
        <WorkoutListitemShort workout={workout} key={workout.id} style={{}} />
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
