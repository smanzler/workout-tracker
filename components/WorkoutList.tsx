import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { workoutsCollection } from "@/db";
import { Workout } from "@/models/Workout";
import WorkoutListItem from "./WorkoutListItem";
import { Q } from "@nozbe/watermelondb";

const WorkoutList = ({ workouts }: { workouts: Workout[] }) => {
  return (
    <ScrollView>
      {workouts &&
        workouts.map((workout) => (
          <WorkoutListItem key={workout.id} workout={workout} />
        ))}
      <View style={{ height: 200 }} />
    </ScrollView>
  );
};

const enhance = withObservables([], () => ({
  workouts: workoutsCollection
    .query(Q.where("endTime", Q.notEq(null)), Q.sortBy("start_time", Q.desc))
    .observeWithColumns(["start_time"]),
}));

export default enhance(WorkoutList);

const styles = StyleSheet.create({});
