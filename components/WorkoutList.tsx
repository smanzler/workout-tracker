import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { workoutsCollection } from "@/db";
import { Workout } from "@/models/Workout";
import WorkoutListItem from "./WorkoutListItem";

const WorkoutList = ({ workouts }: { workouts: Workout[] }) => {
  return (
    <ScrollView>
      {workouts &&
        workouts.map((workout) => (
          <WorkoutListItem key={workout.id} workout={workout} />
        ))}
    </ScrollView>
  );
};

const enhance = withObservables([], () => ({
  workouts: workoutsCollection.query(),
}));

export default enhance(WorkoutList);

const styles = StyleSheet.create({});
