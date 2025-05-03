import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import database from "@/db";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import { RoutineSet, useRoutineActions } from "@/stores/routineStore";
import WRSetItem from "./WRSetItem";

const RoutineSetListItem = ({
  exerciseIndex,
  set,
  index,
  inputRefs,
}: {
  exerciseIndex: number;
  set: RoutineSet;
  index: number;
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
}) => {
  const { updateSetReps, updateSetWeight, removeSetAtIndex } =
    useRoutineActions();

  return (
    <WRSetItem
      type="routine"
      set={set}
      index={index}
      exerciseIndex={exerciseIndex}
      inputRefs={inputRefs}
      handleDelete={() => removeSetAtIndex(exerciseIndex, index)}
      handleUpdate={(field, value) => {
        if (field === "weight") {
          updateSetWeight(exerciseIndex, index, value);
        } else if (field === "reps") {
          updateSetReps(exerciseIndex, index, value);
        }
      }}
    />
  );
};

export default RoutineSetListItem;
