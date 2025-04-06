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
import { RoutineSet } from "@/models/RoutineSets";

const RoutineSetListItem = ({
  routineSet,
  index,
}: {
  routineSet: RoutineSet;
  index: number;
}) => {
  const [weight, setWeight] = useState(routineSet.weight?.toString() || "");
  const [reps, setReps] = useState(routineSet.reps?.toString() || "");
  const theme = useTheme();

  const isCompleteable = weight !== "" && reps !== "";

  const handleUpdate = async (field: "weight" | "reps", value: string) => {
    const newValue = value === "" ? undefined : parseInt(value);

    await database.write(async () => {
      await routineSet.update((record) => {
        record[field] = newValue;
      });
    });
  };

  const handleDelete = () => {
    try {
      database.write(async () => {
        await routineSet.markAsDeleted();
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
      <Animated.View style={[styles.container, animatedStyle]}>
        <Text
          style={[
            styles.item,
            styles.order,
            {
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
            },
          ]}
        >
          {index}
        </Text>
        <Text style={{ color: theme.colors.text }}>-</Text>
        <View style={styles.rightContainer}>
          <TextInput
            style={[
              styles.item,
              styles.weight,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
              },
            ]}
            value={weight}
            onChangeText={(text) => {
              setWeight(text);
              handleUpdate("weight", text);
            }}
            keyboardType="numeric"
            placeholder="0"
          />
          <TextInput
            style={[
              styles.item,
              styles.reps,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
              },
            ]}
            value={reps}
            onChangeText={(text) => {
              setReps(text);
              handleUpdate("reps", text);
            }}
            keyboardType="numeric"
            placeholder="0"
          />
          <View style={[styles.button]}>
            <FontAwesome5 name="minus" size={16} color={theme.colors.text} />
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export default RoutineSetListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 20,
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
    backgroundColor: "rgba(89, 181, 89, 0.2)",
  },
  completedButton: {
    backgroundColor: "#59b559",
  },
});
