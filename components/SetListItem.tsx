import React, { useEffect, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Set } from "@/models/Set";
import { FontAwesome5 } from "@expo/vector-icons";
import database from "@/db";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Q } from "@nozbe/watermelondb";
import { useTheme } from "@react-navigation/native";

const SetListItem = ({
  set,
  workoutExerciseId,
  index,
  exerciseIndex,
  inputRefs,
}: {
  set: Set;
  workoutExerciseId: string;
  index: number;
  exerciseIndex: number;
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
}) => {
  const [weight, setWeight] = useState(set.weight?.toString() || "");
  const [reps, setReps] = useState(set.reps?.toString() || "");
  const [completed, setCompleted] = useState(set.completed || false);
  const [weightFocused, setWeightFocused] = useState(false);
  const [repsFocused, setRepsFocused] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    if (!inputRefs.current[exerciseIndex]) {
      inputRefs.current[exerciseIndex] = [];
    }
    inputRefs.current[exerciseIndex][index * 2] = null;
    inputRefs.current[exerciseIndex][index * 2 + 1] = null;
  }, []);

  const handleWeightSubmit = () => {
    inputRefs.current[exerciseIndex]?.[index * 2 + 1]?.focus();
  };

  const handleRepsSubmit = async () => {
    const currentInputs = inputRefs.current;

    if (!completed) {
      const toggled = await toggleCompleted();

      if (!toggled) {
        Keyboard.dismiss();
        return;
      }
    }

    if (index * 2 + 2 < (currentInputs[exerciseIndex]?.length || 0)) {
      currentInputs[exerciseIndex]?.[index * 2 + 2]?.focus();
    } else if (exerciseIndex + 1 < currentInputs.length) {
      currentInputs[exerciseIndex + 1]?.[2]?.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  const isCompleteable = weight !== "" && reps !== "";

  const handleUpdate = async (field: "weight" | "reps", value: string) => {
    const newValue = value === "" ? undefined : parseInt(value);

    await database.write(async () => {
      await set.update((record) => {
        record[field] = newValue;
      });
    });
  };

  const toggleCompleted = async () => {
    if (!isCompleteable) return false;

    Keyboard.dismiss();

    const newCompleted = !completed;
    setCompleted(newCompleted);

    await database.write(async () => {
      await set.update((record) => {
        record.completed = newCompleted;
      });
    });

    return true;
  };

  const handleDelete = () => {
    try {
      database.write(async () => {
        await set.markAsDeleted();
      });
    } catch (error) {
      console.error("Failed to delete exercise:", error);
    }
  };

  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .failOffsetY([-5, 5])
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.max(-100, event.translationX);
    })
    .onEnd(() => {
      if (translateX.value < -50) {
        runOnJS(handleDelete)();
      }
      translateX.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: withTiming(translateX.value < -50 ? 0 : 1),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          completed && styles.completedRow,
          animatedStyle,
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
        <Text style={{ color: colors.text }}>-</Text>
        <View style={styles.rightContainer}>
          <TextInput
            ref={(ref) => {
              if (inputRefs.current[exerciseIndex]) {
                inputRefs.current[exerciseIndex][index * 2] = ref;
              }
            }}
            style={[
              styles.item,
              styles.weight,
              {
                backgroundColor: completed ? "transparent" : colors.background,
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
            onChangeText={(text) => {
              setWeight(text);
              handleUpdate("weight", text);
            }}
            placeholder="0"
            placeholderTextColor={colors.text
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
                inputRefs.current[exerciseIndex][index * 2 + 1] = ref;
              }
            }}
            style={[
              styles.item,
              styles.reps,
              {
                backgroundColor: completed ? "transparent" : colors.background,
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
            onChangeText={(text) => {
              setReps(text);
              handleUpdate("reps", text);
            }}
            returnKeyType="next"
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.text
              .replace("rgb", "rgba")
              .replace(")", ", 0.5)")}
            submitBehavior="submit"
            onSubmitEditing={handleRepsSubmit}
            onFocus={() => setRepsFocused(true)}
            onBlur={() => setRepsFocused(false)}
          />
          <TouchableOpacity
            style={[
              styles.button,
              completed
                ? styles.completedButton
                : { backgroundColor: colors.background },
            ]}
            onPress={toggleCompleted}
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
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export default SetListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 20,
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
    width: 40,
    textAlign: "center",
  },
  reps: {
    width: 40,
    textAlign: "center",
  },
  completedRow: {
    backgroundColor: "rgba(89, 181, 89, 0.2)",
  },
  completedButton: {
    backgroundColor: "#59b559",
  },
});
