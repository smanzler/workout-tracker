import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
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
import {
  Entypo,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import database from "@/db";
import { useTheme } from "@react-navigation/native";
import { Set } from "@/models/Set";

const WorkoutListItem = ({
  workout,
  workoutExercises,
}: {
  workout: Workout;
  workoutExercises: WorkoutExercise[];
}) => {
  const theme = useTheme();
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalPRCount, setTotalPRCount] = useState(0);

  useEffect(() => {
    const calculateTotalVolume = async () => {
      let total = 0;

      for (const workoutExercise of workoutExercises) {
        const sets = await workoutExercise.sets.fetch();

        total += sets.reduce((sum, set) => {
          if (set.weight != null && set.reps != null) {
            return sum + set.weight * set.reps;
          }
          return sum;
        }, 0);
      }

      setTotalVolume(total);
    };

    const fetchPRCount = async () => {
      const count = (
        await Promise.all(
          workoutExercises.map(async (workoutExercise) => {
            const sets = await workoutExercise.sets;
            return sets.reduce((total, set) => {
              return (
                total +
                (set.isWeightPr ? 1 : 0) +
                (set.isVolumePr ? 1 : 0) +
                (set.is1RMPr ? 1 : 0)
              );
            }, 0);
          })
        )
      ).reduce((sum, count) => sum + count, 0);

      setTotalPRCount(count);
    };

    calculateTotalVolume();
    fetchPRCount();
  }, [workoutExercises]);

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

  function formatWorkoutDuration(): string {
    const durationInSeconds = Math.floor(
      ((workout.endTime ?? workout.startTime) - workout.startTime) / 1000
    );

    if (durationInSeconds < 60) {
      return `${durationInSeconds}s`;
    }

    const minutes = Math.floor(durationInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }

    return `${minutes}m`;
  }

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

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
          opacity: 0.6,
        }}
      >
        <View style={[styles.item]}>
          <MaterialCommunityIcons
            name="clock-time-five"
            color={theme.colors.text}
            size={18}
          />
          <Text style={[styles.itemText, { color: theme.colors.text }]}>
            {formatWorkoutDuration()}
          </Text>
        </View>
        <View style={[styles.item]}>
          <MaterialCommunityIcons
            name="weight"
            color={theme.colors.text}
            size={18}
          />
          <Text style={[styles.itemText, { color: theme.colors.text }]}>
            {totalVolume} lb
          </Text>
        </View>
        <View style={[styles.item]}>
          <MaterialCommunityIcons
            name="trophy"
            color={theme.colors.text}
            size={18}
          />
          <Text style={[styles.itemText, { color: theme.colors.text }]}>
            {totalPRCount} PRs
          </Text>
        </View>
      </View>

      {workoutExercises.length !== 0 && (
        <>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={[
                styles.header2,
                { color: theme.colors.text, width: "50%" },
              ]}
            >
              Exercise
            </Text>
            <Text style={[styles.header2, { color: theme.colors.text }]}>
              Best Set
            </Text>
          </View>
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
    padding: 20,
    borderRadius: 20,
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
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    gap: 5,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  header2: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 3,
  },
});
