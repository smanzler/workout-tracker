import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import dayjs from "dayjs";
import React from "react";
import { Workout } from "@/models/Workout";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import WorkoutExerciseTitle from "./WorkoutExerciseTitle";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/zeego/drop-down";
import { Entypo } from "@expo/vector-icons";
import database from "@/db";
import { useTheme } from "@react-navigation/native";

const WorkoutListItem = ({
  workout,
  workoutExercises,
}: {
  workout: Workout;
  workoutExercises: WorkoutExercise[];
}) => {
  const theme = useTheme();

  const handleDelete = () => {
    try {
      database.write(async () => {
        const setsToDelete = await Promise.all(
          workoutExercises.map((we) => we.sets.fetch())
        );

        const workoutExerciseDeletions = await Promise.all(
          workoutExercises.map((we) => we.markAsDeleted())
        );
        const setDeletions = await Promise.all(
          setsToDelete.flat().map((set) => set.markAsDeleted())
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.colors.text }]}>
          Workout
        </Text>
        <DropdownMenuRoot>
          <DropdownMenuTrigger>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.colors.background }]}
            >
              <Entypo
                name="dots-three-horizontal"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem destructive key="delete" onSelect={handleDelete}>
              <DropdownMenuItemTitle>Delete Workout</DropdownMenuItemTitle>
              <DropdownMenuItemIcon ios={{ name: "trash" }} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </View>
      <Text style={[styles.dateText, { color: theme.colors.text }]}>
        {dayjs(workout.startTime).format("dddd, MMM D")}
      </Text>
      {workoutExercises.length !== 0 && (
        <>
          <Text style={[styles.header2, { color: theme.colors.text }]}>
            Exercises
          </Text>
          {workoutExercises.map((workoutExercise) => (
            <WorkoutExerciseTitle
              key={workoutExercise.id}
              workoutExercise={workoutExercise}
            />
          ))}
        </>
      )}
    </View>
  );
};

const enhance = withObservables(["workout"], ({ workout }) => ({
  workout,
  workoutExercises: workout.workoutExercises,
}));

export default enhance(WorkoutListItem);

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
  },
  btn: {
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 500,
    opacity: 0.6,
    marginBottom: 7,
  },
  header2: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
