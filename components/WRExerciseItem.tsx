import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { DropdownMenuItemIcon } from "@/zeego/drop-down";
import { DropdownMenuItemTitle } from "@/zeego/drop-down";
import { DropdownMenuItem } from "@/zeego/drop-down";
import { DropdownMenuContent } from "@/zeego/drop-down";
import ButtonWithIcon from "./ButtonWithIcon";
import { DropdownMenuRoot, DropdownMenuTrigger } from "@/zeego/drop-down";
import { Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Exercise } from "@/models/Exercise";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Set } from "@/models/Set";
import SetListItem from "./SetListItem";
import { RoutineExercise, RoutineSet } from "@/stores/routineStore";
import RoutineSetListItem from "./RoutineSetListItem";

const WRExerciseItem = ({
  type,
  exercise,
  sets,
  workoutExercise,
  exerciseIndex,
  inputRefs,
  handleDelete,
  handleAddSet,
}: {
  type: "workout" | "routine";
  exercise: Exercise | RoutineExercise;
  sets: Set[] | RoutineSet[];
  workoutExercise?: WorkoutExercise;
  exerciseIndex: number;
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
  handleDelete: () => void;
  handleAddSet: () => void;
}) => {
  const { colors } = useTheme();

  const title = "title" in exercise ? exercise.title : exercise.exercise.title;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.headerContainer}>
        <Text
          style={[styles.headerText, { color: colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <DropdownMenuRoot>
          <DropdownMenuTrigger>
            <ButtonWithIcon>
              <Entypo
                name="dots-three-horizontal"
                size={24}
                color={colors.text}
              />
            </ButtonWithIcon>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem destructive key="delete" onSelect={handleDelete}>
              <DropdownMenuItemTitle>Remove Exercise</DropdownMenuItemTitle>
              <DropdownMenuItemIcon ios={{ name: "trash" }} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </View>
      <View style={styles.setsHeader}>
        <Text
          style={[
            styles.setHeaderText,
            {
              width: 30,
              textAlign: "center",
              color: colors.text,
            },
          ]}
        >
          Set
        </Text>
        <Text
          style={[
            styles.setHeaderText,
            { width: 80, textAlign: "center", color: colors.text },
          ]}
        >
          Previous
        </Text>
        <View style={styles.rightContainer}>
          <Text
            style={[
              styles.setHeaderText,
              { width: 60, textAlign: "center", color: colors.text },
            ]}
          >
            lbs
          </Text>
          <Text
            style={[
              styles.setHeaderText,
              { width: 60, textAlign: "center", color: colors.text },
            ]}
          >
            Reps
          </Text>
          <View style={{ width: 30, alignItems: "center" }}>
            <FontAwesome5
              name={type === "workout" ? "check" : "lock"}
              size={16}
              color={colors.text}
            />
          </View>
        </View>
      </View>
      {sets.map((set, index) => {
        if (workoutExercise && "id" in set) {
          return (
            <SetListItem
              key={set.id}
              set={set}
              workoutExerciseId={workoutExercise.id}
              index={index + 1}
              exerciseIndex={exerciseIndex}
              inputRefs={inputRefs}
            />
          );
        } else if (!("id" in set)) {
          return (
            <RoutineSetListItem
              key={`${exerciseIndex}:${index}`}
              exerciseIndex={exerciseIndex}
              set={set}
              index={index + 1}
              inputRefs={inputRefs}
            />
          );
        }
      })}
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: colors.background }]}
        onPress={handleAddSet}
      >
        <Feather name="plus" size={16} color={colors.text} />
        <Text style={[styles.addBtnText, { color: colors.text }]}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WRExerciseItem;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    marginBottom: 20,
    borderRadius: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 16,
    gap: 10,
  },
  btn: {
    paddingHorizontal: 5,
    backgroundColor: "#e8e8e8",
    borderRadius: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    flexShrink: 1,
  },
  setsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
    marginHorizontal: 16,
  },
  rightContainer: {
    flexDirection: "row",
    gap: 10,
  },
  setHeaderText: {
    fontWeight: 500,
    fontSize: 16,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    fontWeight: 500,
    padding: 5,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  addBtnText: {
    fontWeight: 500,
  },
});
