import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { RectButton } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useTheme } from "expo-router/react-navigation";
import { Set } from "@/models/Set";
import { RoutineSet } from "@/stores/routineStore";
import { setsCollection } from "@/db";
import { Q } from "@nozbe/watermelondb";
import { ThemedText } from "./ThemedText";

const WRSetItem = ({
  type,
  set,
  index,
  exerciseId,
  exerciseIndex,
  inputRefs,
  handleDelete,
  handleUpdate,
  toggleCompleted,
  previousSetInExercise,
}: {
  type: "workout" | "routine";
  set: Set | RoutineSet;
  index: number;
  exerciseId: string;
  exerciseIndex: number;
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
  handleDelete: () => void;
  handleUpdate: (field: "weight" | "reps", value: string) => void;
  toggleCompleted?: (newCompleted: boolean) => Promise<void> | void;
  previousSetInExercise?: {
    weight?: string;
    reps?: string;
  };
}) => {
  const [weight, setWeight] = useState(set.weight?.toString() || "");
  const [reps, setReps] = useState(set.reps?.toString() || "");
  const [completed, setCompleted] = useState(
    "completed" in set ? set.completed : false,
  );
  const [weightFocused, setWeightFocused] = useState(false);
  const [repsFocused, setRepsFocused] = useState(false);
  const [previousSet, setPreviousSet] = useState<{
    weight: number;
    reps: number;
  } | null>(null);

  const { colors } = useTheme();

  const isCompleteable =
    (weight !== "" && reps !== "") ||
    (previousSet?.weight !== undefined && previousSet?.reps !== undefined) ||
    (previousSetInExercise?.weight !== undefined &&
      previousSetInExercise?.reps !== undefined);

  const fetchPreviousSet = async () => {
    const previousSet = await setsCollection
      .query(
        Q.unsafeSqlQuery(
          `
            SELECT sets.weight, sets.reps
            FROM sets
            JOIN workout_exercises ON sets.workout_exercise_id = workout_exercises.id
            JOIN workouts ON workout_exercises.workout_id = workouts.id
            WHERE workout_exercises.exercise_id = ?
              AND sets.position = ?
              AND workouts.end_time IS NOT NULL
              AND sets._status != 'deleted'
            ORDER BY workouts.start_time DESC LIMIT 1
            `,
          [exerciseId, index],
        ),
      )
      .unsafeFetchRaw();

    setPreviousSet(previousSet[0]);
  };

  useEffect(() => {
    if (!inputRefs.current[exerciseIndex]) {
      // eslint-disable-next-line react-hooks/immutability
      inputRefs.current[exerciseIndex] = [];
    }
    inputRefs.current[exerciseIndex][index * 2] = null;
    inputRefs.current[exerciseIndex][index * 2 + 1] = null;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPreviousSet();
  }, []);

  const handleWeightSubmit = () => {
    inputRefs.current[exerciseIndex]?.[index * 2 + 1]?.focus();
  };

  const handleCompleted = async () => {
    if (!isCompleteable) return false;

    Keyboard.dismiss();

    const newCompleted = !completed;
    setCompleted(newCompleted);

    if (toggleCompleted) {
      await toggleCompleted(newCompleted);

      if (weight === "") {
        const newWeight =
          previousSet?.weight?.toString() || previousSetInExercise?.weight;
        if (newWeight) {
          setWeight(newWeight);
          handleUpdate("weight", newWeight);
        }
      }

      if (reps === "") {
        const newReps =
          previousSet?.reps?.toString() || previousSetInExercise?.reps;
        if (newReps) {
          setReps(newReps);
          handleUpdate("reps", newReps);
        }
      }
    }

    return true;
  };

  const handleRepsSubmit = async () => {
    const currentInputs = inputRefs.current;

    if (!completed) {
      await handleCompleted();
    }

    if (index * 2 + 2 < (currentInputs[exerciseIndex]?.length || 0)) {
      currentInputs[exerciseIndex]?.[index * 2 + 2]?.focus();
    } else if (exerciseIndex + 1 < currentInputs.length) {
      currentInputs[exerciseIndex + 1]?.[2]?.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  const renderRightActions = () => {
    return (
      <RectButton style={[styles.deleteButton]} onPress={handleDelete}>
        <View style={styles.deleteButtonContent}>
          <FontAwesome5 name="trash-alt" size={20} color="white" />
        </View>
      </RectButton>
    );
  };

  return (
    <ReanimatedSwipeable
      renderRightActions={renderRightActions}
      friction={2}
      containerStyle={{ backgroundColor: "#ff4444" }}
    >
      <View style={{ backgroundColor: colors.card }}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.card },
            completed && styles.completedRow,
          ]}
        >
          <Text
            style={[
              styles.item,
              styles.order,
              {
                backgroundColor: completed ? "transparent" : colors.background,
                borderColor: completed ? "transparent" : colors.background,
                color: colors.text,
              },
            ]}
          >
            {index}
          </Text>
          <ThemedText type="defaultSemiBold">
            {previousSet
              ? `${previousSet.weight} lb x ${previousSet.reps}`
              : "-"}
          </ThemedText>
          <View style={styles.rightContainer}>
            <TextInput
              ref={(ref) => {
                if (inputRefs.current[exerciseIndex]) {
                  // eslint-disable-next-line react-hooks/immutability
                  inputRefs.current[exerciseIndex][index * 2] = ref;
                }
              }}
              style={[
                styles.item,
                styles.weight,
                {
                  backgroundColor: completed
                    ? "transparent"
                    : colors.background,
                  borderColor: weightFocused
                    ? colors.text
                    : completed
                      ? "transparent"
                      : colors.background,
                  color: colors.text,
                },
              ]}
              value={weight}
              editable={!completed}
              selectTextOnFocus
              onChangeText={(text) => {
                setWeight(text);
                handleUpdate("weight", text);
              }}
              placeholder={
                previousSet?.weight?.toString() || previousSetInExercise?.weight
              }
              placeholderTextColor={String(colors.text)
                .replace("rgb", "rgba")
                .replace(")", ", 0.5)")}
              keyboardType="numeric"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={handleWeightSubmit}
              onFocus={() => setWeightFocused(true)}
              onBlur={() => setWeightFocused(false)}
            />
            <TextInput
              ref={(ref) => {
                if (inputRefs.current[exerciseIndex]) {
                  // eslint-disable-next-line react-hooks/immutability
                  inputRefs.current[exerciseIndex][index * 2 + 1] = ref;
                }
              }}
              style={[
                styles.item,
                styles.reps,
                {
                  backgroundColor: completed
                    ? "transparent"
                    : colors.background,
                  borderColor: repsFocused
                    ? colors.text
                    : completed
                      ? "transparent"
                      : colors.background,
                  color: colors.text,
                },
              ]}
              value={reps}
              editable={!completed}
              selectTextOnFocus
              onChangeText={(text) => {
                setReps(text);
                handleUpdate("reps", text);
              }}
              returnKeyType="next"
              keyboardType="number-pad"
              placeholder={
                previousSet?.reps?.toString() || previousSetInExercise?.reps
              }
              placeholderTextColor={String(colors.text)
                .replace("rgb", "rgba")
                .replace(")", ", 0.5)")}
              submitBehavior="submit"
              onSubmitEditing={handleRepsSubmit}
              onFocus={() => setRepsFocused(true)}
              onBlur={() => setRepsFocused(false)}
            />
            {type === "workout" ? (
              <TouchableOpacity
                style={[
                  styles.button,
                  completed
                    ? styles.completedButton
                    : { backgroundColor: colors.background },
                ]}
                onPress={handleCompleted}
                disabled={!isCompleteable}
              >
                <FontAwesome5
                  name="check"
                  size={16}
                  color={
                    completed ? "white" : isCompleteable ? colors.text : "gray"
                  }
                />
              </TouchableOpacity>
            ) : (
              <View style={[styles.button, { backgroundColor: colors.card }]}>
                <FontAwesome5 name="minus" size={16} color="white" />
              </View>
            )}
          </View>
        </View>
      </View>
    </ReanimatedSwipeable>
  );
};

export default WRSetItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  item: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    borderRadius: 5,
    borderWidth: 2,
  },
  button: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  order: {
    width: 30,
  },
  rightContainer: {
    flexDirection: "row",
    gap: 10,
  },
  weight: {
    width: 60,
    textAlign: "center",
  },
  reps: {
    width: 60,
    textAlign: "center",
  },
  completedRow: {
    backgroundColor: "rgba(35, 183, 35, 0.2)",
  },
  completedButton: {
    backgroundColor: "rgb(35, 183, 35)",
  },
  deleteButton: {
    width: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonContent: {
    flex: 1,
    justifyContent: "center",
  },
});
