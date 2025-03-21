import React, { useState } from "react";
import {
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

const SetListItem = ({
  set,
  workoutExerciseId,
}: {
  set: Set;
  workoutExerciseId: string;
}) => {
  const [weight, setWeight] = useState(set.weight?.toString() || "");
  const [reps, setReps] = useState(set.reps?.toString() || "");
  const [completed, setCompleted] = useState(set.completed || false);

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
    if (!isCompleteable) return;

    const newCompleted = !completed;
    setCompleted(newCompleted);

    await database.write(async () => {
      await set.update((record) => {
        record.completed = newCompleted;
      });
    });
  };

  const handleDelete = () => {
    try {
      database.write(async () => {
        await set.markAsDeleted();

        const remainingSets = await database
          .get<Set>("sets")
          .query(
            Q.where("workout_exercise_id", workoutExerciseId),
            Q.sortBy("order", Q.asc)
          )
          .fetch();

        for (let i = 0; i < remainingSets.length; i++) {
          await remainingSets[i].update((record) => {
            record.order = i + 1;
          });
        }
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
        <Text style={[styles.item, styles.order]}>{set.order}</Text>
        <Text>-</Text>
        <View style={styles.rightContainer}>
          <TextInput
            style={[styles.item, styles.weight]}
            value={weight}
            onChangeText={setWeight}
            onBlur={() => handleUpdate("weight", weight)}
            keyboardType="numeric"
            placeholder="0"
          />
          <TextInput
            style={[styles.item, styles.reps]}
            value={reps}
            onChangeText={setReps}
            onBlur={() => handleUpdate("reps", reps)}
            keyboardType="numeric"
            placeholder="0"
          />
          <TouchableOpacity
            style={[
              styles.button,
              completed ? styles.completedButton : styles.incompleteButton,
            ]}
            onPress={toggleCompleted}
          >
            <FontAwesome5 name="check" size={16} color="black" />
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
    padding: 5,
    borderRadius: 5,
  },
  item: {
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "#e8e8e8",
    borderRadius: 5,
  },
  button: {
    width: 30,
    alignItems: "center",
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
    backgroundColor: "#d4edda",
  },
  completedButton: {
    backgroundColor: "#28a745",
  },
  incompleteButton: {
    backgroundColor: "#e8e8e8",
  },
});
