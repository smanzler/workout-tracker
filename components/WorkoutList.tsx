import { StyleSheet } from "react-native";
import React from "react";
import { Workout } from "@/models/Workout";
import WorkoutListItem from "./WorkoutListItem";

const WorkoutList = ({ workouts }: { workouts: Workout[] }) => {
  return (
    <>
      {workouts &&
        workouts.map((workout) => (
          <WorkoutListItem key={workout.id} workout={workout} />
        ))}
    </>
  );
};

export default WorkoutList;

const styles = StyleSheet.create({});
