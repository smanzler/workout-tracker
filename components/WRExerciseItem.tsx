import { StyleSheet, TextInput, View } from "react-native";
import React from "react";
import ButtonWithIcon from "./ButtonWithIcon";
import { useMenu } from "@/hooks/useMenu";
import { Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import { Exercise } from "@/models/Exercise";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Set } from "@/models/Set";
import SetListItem from "./SetListItem";
import { RoutineExercise, RoutineSet } from "@/stores/routineStore";
import RoutineSetListItem from "./RoutineSetListItem";
import { ThemedText } from "./ThemedText";
import Button from "./Button";
import EditWorkoutSetListItem from "./EditWorkoutSetListItem";
import {
  WorkoutSet,
  WorkoutExercise as EditWorkoutExercise,
} from "@/stores/workoutStore";

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
  exercise: Exercise | RoutineExercise | EditWorkoutExercise;
  sets: Set[] | RoutineSet[] | WorkoutSet[];
  workoutExercise?: WorkoutExercise;
  exerciseIndex: number;
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
  handleDelete: () => void;
  handleAddSet: () => void;
}) => {
  const { colors } = useTheme();
  const showMenu = useMenu();

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
        <ButtonWithIcon
          onPress={() =>
            showMenu([
              {
                label: "Remove Exercise",
                onSelect: handleDelete,
                destructive: true,
              },
            ])
          }
        >
          <Entypo name="dots-three-horizontal" size={24} color={colors.text} />
        </ButtonWithIcon>
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

        if (
          workoutExercise &&
          "completed" in set &&
          "id" in exercise &&
          "workoutExercise" in set
        ) {
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
        } else if ("exercise" in exercise && !("completed" in set)) {
          return (
            <RoutineSetListItem
              key={set.id}
              exerciseIndex={exerciseIndex}
              exerciseId={exercise.exercise.id}
              set={set}
              index={index + 1}
              inputRefs={inputRefs}
              previousSetInExercise={previousSetInExercise}
            />
          );
        } else if (
          "exercise" in exercise &&
          "completed" in set &&
          !("workoutExercise" in set)
        ) {
          return (
            <EditWorkoutSetListItem
              key={set.id}
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
        textStyle={{ color: colors.text }}
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
