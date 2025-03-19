import { Button, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { of as of$ } from "rxjs";
import { useWorkout } from "@/providers/WorkoutProvider";
import { withObservables } from "@nozbe/watermelondb/react";
import database from "@/db";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Workout } from "@/models/Workout";
import { Q } from "@nozbe/watermelondb";
import WorkoutExerciseListItem from "./WorkoutExerciseListItem";

const WorkoutExerciseList = ({
  workout,
  workoutExercises,
}: {
  workout: Workout;
  workoutExercises: WorkoutExercise[];
}) => {
  useEffect(() => {
    console.log(workout.id);
  }, [workout]);

  useEffect(() => {
    console.log(workoutExercises.map((we) => we.id));
  }, [workoutExercises]);

  const seeWorkouts = async () => {
    const workouts = await database.get("workouts").query().fetch();

    console.log(workouts.map((w) => w.id));
    console.log(workoutExercises.map((we) => we.id));
  };

  return (
    <View>
      {workoutExercises.map((workoutExercise) => (
        <WorkoutExerciseListItem
          key={workoutExercise.id}
          workoutExercise={workoutExercise}
        />
      ))}
    </View>
  );
};

const enhance = withObservables(["workout"], ({ workout }) => ({
  workout,
  workoutExercises: workout.workoutExercises,
}));

export default enhance(WorkoutExerciseList);

const styles = StyleSheet.create({});
