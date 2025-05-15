import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Workout } from "@/models/Workout";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/zeego/drop-down";
import { Entypo } from "@expo/vector-icons";
import database, { setsCollection } from "@/db";
import { useTheme } from "@react-navigation/native";
import { Set } from "@/models/Set";
import { Q } from "@nozbe/watermelondb";
import ButtonWithIcon from "./ButtonWithIcon";
import PostWorkoutSummary, { PostWorkout } from "./PostWorkoutSummary";
import { Exercise } from "@/models/Exercise";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIcon,
  ContextMenuItemTitle,
  ContextMenuRoot,
  ContextMenuTrigger,
} from "@/zeego/context-menu";
import { router } from "expo-router";

const WorkoutListItem = ({
  workout,
  workoutExercises,
  sets,
}: {
  workout: Workout;
  workoutExercises: WorkoutExercise[];
  sets: Set[];
}) => {
  const theme = useTheme();
  const [exerciseTitles, setExerciseTitles] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const loadExerciseTitles = async () => {
      const titles: Record<string, string> = {};
      await Promise.all(
        workoutExercises.map(async (we) => {
          const exercise = await we.exercise;
          titles[we.id] = exercise.title;
        })
      );
      setExerciseTitles(titles);
    };

    loadExerciseTitles();
  }, [workoutExercises]);

  const handleDelete = () => {
    try {
      database.write(async () => {
        const workoutExerciseDeletions = await Promise.all(
          workoutExercises.map((we) => we.markAsDeleted())
        );
        const setDeletions = await Promise.all(
          sets.map((set) => set.markAsDeleted())
        );
        const workoutDeletion = await workout.markAsDeleted();

        const batchOps = [
          ...workoutExerciseDeletions,
          ...setDeletions,
          workoutDeletion,
        ];

        await database.batch(...batchOps);
      });
    } catch (error) {
      console.error("Failed to delete workout:", error);
    }
  };

  // Transform the data for PostWorkoutSummary
  const workoutData: PostWorkout = {
    workout_id: workout.id,
    workout_name: workout.name,
    start_time: workout.startTime.toString(),
    end_time: workout.endTime ? workout.endTime.toString() : "",
    exercises: workoutExercises.map((we) => ({
      exercise_title: exerciseTitles[we.id] || "Loading...",
      sets: sets
        .filter((set) => set.workoutExercise.id === we.id)
        .map((set) => ({
          weight: set.weight,
          reps: set.reps,
          is_1rm_pr: set.is1RMPr,
          is_volume_pr: set.isVolumePr,
          is_weight_pr: set.isWeightPr,
        })),
    })),
  };

  return (
    <ContextMenuRoot>
      <ContextMenuTrigger>
        <View
          style={{ borderRadius: 20, marginBottom: 20, overflow: "hidden" }}
        >
          <PostWorkoutSummary workout={workoutData} />
        </View>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem destructive key="delete" onSelect={handleDelete}>
          <ContextMenuItemTitle>Delete Workout</ContextMenuItemTitle>
          <ContextMenuItemIcon ios={{ name: "trash" }} />
        </ContextMenuItem>
        <ContextMenuItem
          key="edit"
          onSelect={() => {
            router.push({
              pathname: "/(modals)/edit_workout",
              params: { workoutId: workout.id },
            });
          }}
        >
          <ContextMenuItemTitle>Edit Workout</ContextMenuItemTitle>
          <ContextMenuItemIcon ios={{ name: "pencil" }} />
        </ContextMenuItem>
        <ContextMenuItem key="add_exercise" onSelect={() => {}}>
          <ContextMenuItemTitle>Share Workout</ContextMenuItemTitle>
          <ContextMenuItemIcon ios={{ name: "square.and.arrow.up" }} />
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuRoot>
  );
};

const enhance = withObservables(
  ["workout"],
  ({ workout }: { workout: Workout }) => {
    const workoutExercises = workout.workoutExercises.observe();
    const sets = setsCollection
      .query(Q.on("workout_exercises", "workout_id", workout.id))
      .observe();

    return {
      workout,
      workoutExercises,
      sets,
    };
  }
);

export default enhance(WorkoutListItem);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
