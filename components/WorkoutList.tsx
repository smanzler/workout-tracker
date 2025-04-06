import { Pressable, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { Workout } from "@/models/Workout";
import WorkoutListItem from "./WorkoutListItem";
import { router } from "expo-router";

const WorkoutList = ({ workouts }: { workouts: Workout[] }) => {
  return (
    <>
      {workouts &&
        workouts.map((workout) => (
          <Pressable
            key={workout.id}
            onPress={() =>
              router.push({
                pathname: "/(modals)/workout_modal",
                params: { workoutId: workout.id },
              })
            }
          >
            <WorkoutListItem workout={workout} />
          </Pressable>
        ))}
      <View style={{ height: 200 }} />
    </>
  );
};

export default WorkoutList;

const styles = StyleSheet.create({});
