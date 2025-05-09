import { StyleSheet, TextInput, View } from "react-native";
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
import { ThemedText } from "./ThemedText";
import Button from "./Button";

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
        <ThemedText
          style={styles.headerText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </ThemedText>
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
        <ThemedText
          type="defaultSemiBold"
          style={[
            styles.setHeaderText,
            {
              width: 30,
            },
          ]}
        >
          Set
        </ThemedText>
        <ThemedText
          style={[styles.setHeaderText, { width: 80 }]}
          type="defaultSemiBold"
        >
          Previous
        </ThemedText>
        <View style={styles.rightContainer}>
          <ThemedText
            style={[styles.setHeaderText, { width: 60 }]}
            type="defaultSemiBold"
          >
            lbs
          </ThemedText>
          <ThemedText
            style={[styles.setHeaderText, { width: 60 }]}
            type="defaultSemiBold"
          >
            Reps
          </ThemedText>
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
        const previousSet = index > 0 ? sets[index - 1] : undefined;
        const previousSetInExercise = previousSet
          ? {
              weight: previousSet.weight?.toString(),
              reps: previousSet.reps?.toString(),
            }
          : undefined;

        if (workoutExercise && "id" in set && "id" in exercise) {
          return (
            <SetListItem
              key={set.id}
              set={set}
              workoutExerciseId={workoutExercise.id}
              exerciseId={exercise.id}
              index={index + 1}
              exerciseIndex={exerciseIndex}
              inputRefs={inputRefs}
              previousSetInExercise={previousSetInExercise}
            />
          );
        } else if (!("id" in set) && "exercise" in exercise) {
          return (
            <RoutineSetListItem
              key={`${exerciseIndex}:${index}`}
              exerciseIndex={exerciseIndex}
              exerciseId={exercise.exercise.id}
              set={set}
              index={index + 1}
              inputRefs={inputRefs}
              previousSetInExercise={previousSetInExercise}
            />
          );
        }
      })}

      <Button
        style={{
          marginHorizontal: 16,
          marginTop: 10,
          backgroundColor: colors.background,
        }}
        onPress={handleAddSet}
        size="sm"
      >
        Add Set
      </Button>
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
    textAlign: "center",
  },
});
