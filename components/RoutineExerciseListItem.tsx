import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

const RoutineExerciseListItem = ({
  exercise,
  index,
}: {
  exercise: RoutineExercise;
  index: number;
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { removeExercise, addSetToExercise } = useRoutineActions();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.headerContainer}>
        <Text
          style={[styles.headerText, { color: theme.colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {exercise.exercise.title}
        </Text>
        <DropdownMenuRoot>
          <DropdownMenuTrigger>
            <ButtonWithIcon>
              <Entypo
                name="dots-three-horizontal"
                size={24}
                color={theme.colors.text}
              />
            </ButtonWithIcon>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              destructive
              key="delete"
              onSelect={() => removeExercise(index)}
            >
              <DropdownMenuItemTitle>Delete Exercise</DropdownMenuItemTitle>
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
              color: theme.colors.text,
            },
          ]}
        >
          Set
        </Text>
        <Text
          style={[
            styles.setHeaderText,
            { width: 80, textAlign: "center", color: theme.colors.text },
          ]}
        >
          Previous
        </Text>
        <View style={styles.rightContainer}>
          <Text
            style={[
              styles.setHeaderText,
              { width: 40, textAlign: "center", color: theme.colors.text },
            ]}
          >
            lbs
          </Text>
          <Text
            style={[
              styles.setHeaderText,
              { width: 40, textAlign: "center", color: theme.colors.text },
            ]}
          >
            Reps
          </Text>
          <View style={{ width: 30, alignItems: "center" }}>
            <FontAwesome5 name="lock" size={16} color={theme.colors.text} />
          </View>
        </View>
      </View>
      {exercise.sets.map((set, i) => (
        <RoutineSetListItem
          key={`${index}:${i}`}
          exerciseIndex={index}
          set={set}
          index={i}
        />
      ))}

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.colors.background }]}
        onPress={() =>
          addSetToExercise(index, {
            reps: undefined,
            weight: undefined,
          })
        }
      >
        <Text style={[styles.addBtnText, { color: theme.colors.text }]}>
          Add Set
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoutineExerciseListItem;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 20,
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
    marginHorizontal: 20,
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
    fontWeight: 600,
    padding: 5,
    marginHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  addBtnText: {
    fontWeight: 500,
  },
});
