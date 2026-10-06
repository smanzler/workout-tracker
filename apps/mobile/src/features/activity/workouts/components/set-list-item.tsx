import React, { useEffect, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Set } from "@/db/models/set";
import { FontAwesome5 } from "@expo/vector-icons";
import database from "@/db";
import { RectButton } from "react-native-gesture-handler";
import { Q } from "@nozbe/watermelondb";
import { useTheme } from "expo-router/react-navigation";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { SharedValue } from "react-native-reanimated";
import WRSetItem from "@/features/activity/components/wr-set-item";

const SetListItem = ({
  set,
  workoutExerciseId,
  exerciseId,
  index,
  exerciseIndex,
  inputRefs,
  previousSetInExercise,
}: {
  set: Set;
  workoutExerciseId: string;
  exerciseId: string;
  index: number;
  exerciseIndex: number;
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
  previousSetInExercise?: {
    weight?: string;
    reps?: string;
  };
}) => {
  const handleUpdate = async (field: "weight" | "reps", value: string) => {
    const newValue = value === "" ? undefined : parseInt(value);

    await database.write(async () => {
      await set.update((record) => {
        record[field] = newValue;
      });
    });
  };

  const toggleCompleted = async (newCompleted: boolean) => {
    await database.write(async () => {
      await set.update((record) => {
        record.completed = newCompleted;
      });
    });
  };

  const handleDelete = async () => {
    try {
      await database.write(async () => {
        const laterSets = (await database
          .get("sets")
          .query(
            Q.where("workout_exercise_id", workoutExerciseId),
            Q.where("position", Q.gt(set.position)),
            Q.sortBy("position", Q.asc),
          )
          .fetch()) as Set[];

        await set.markAsDeleted();

        const allSets = (await database
          .get("sets")
          .query(
            Q.where("workout_exercise_id", workoutExerciseId),
            Q.sortBy("position", Q.asc),
          )
          .fetch()) as Set[];

        await Promise.all(
          allSets.map((s, index) =>
            s.update((record) => {
              record.position = index + 1;
            }),
          ),
        );
      });
    } catch (error) {
      console.error("Failed to delete set:", error);
    }
  };

  return (
    <WRSetItem
      type="workout"
      set={set}
      exerciseId={exerciseId}
      index={index}
      exerciseIndex={exerciseIndex}
      inputRefs={inputRefs}
      handleDelete={handleDelete}
      handleUpdate={handleUpdate}
      toggleCompleted={toggleCompleted}
      previousSetInExercise={previousSetInExercise}
    />
  );
};

export default SetListItem;
