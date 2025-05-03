import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import React from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { Exercise } from "@/models/Exercise";
import { Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/zeego/drop-down";
import database, { routineSetsCollection, setsCollection } from "@/db";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/providers/AuthProvider";
import RoutineSetListItem from "./RoutineSetListItem";
import { RoutineSet } from "@/models/RoutineSets";
import ButtonWithIcon from "./ButtonWithIcon";
import { RoutineExercise, useRoutineActions } from "@/stores/routineStore";
import WRExerciseItem from "./WRExerciseItem";

const RoutineExerciseListItem = ({
  exercise,
  index,
  inputRefs,
}: {
  exercise: RoutineExercise;
  index: number;
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
}) => {
  const { removeExercise, addSetToExercise } = useRoutineActions();

  return (
    <WRExerciseItem
      type="routine"
      exercise={exercise}
      sets={exercise.sets}
      exerciseIndex={index}
      inputRefs={inputRefs}
      handleDelete={() => removeExercise(index)}
      handleAddSet={() => addSetToExercise(index, { reps: "", weight: "" })}
    />
  );
};

export default RoutineExerciseListItem;
