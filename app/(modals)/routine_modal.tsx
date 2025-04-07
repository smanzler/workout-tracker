import {
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Button as RNButton,
} from "react-native";
import { of as of$ } from "rxjs";
import React, { useEffect, useState } from "react";
import { Workout } from "@/models/Workout";
import { BlurView } from "expo-blur";
import { useTheme } from "@react-navigation/native";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/Button";
import { router, useLocalSearchParams } from "expo-router";
import { routinesCollection, workoutsCollection } from "@/db";
import dayjs from "dayjs";
import { Set } from "@/models/Set";
import WorkoutModalWorkoutExercise from "@/components/WorkoutModalWorkoutExercise";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Exercise } from "@/models/Exercise";
import { Routine } from "@/models/Routine";
import RoutineExerciseView from "@/components/RoutineExerciseView";
import { useWorkout } from "@/providers/WorkoutProvider";
import ButtonWithIcon from "@/components/ButtonWithIcon";

const RoutineModal = () => {
  const { colors } = useTheme();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const [routine, setRoutine] = useState<Routine | undefined>(undefined);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const opacity = useSharedValue(0);
  const { startWorkout } = useWorkout();

  useEffect(() => {
    const loadWorkout = async () => {
      if (!routineId) return;

      setLoading(true);

      const r = await routinesCollection.find(routineId);
      setRoutine(r);

      const rExercises = await r.routineExercises.fetch();
      const e = await Promise.all(
        rExercises.map(
          async (re) =>
            // @ts-ignore
            await re.exercise.fetch()
        )
      );
      setExercises(e);

      setLoading(false);
    };

    loadWorkout();
  }, [routineId]);

  useEffect(() => {
    if (!loading) {
      opacity.value = withTiming(1, { duration: 500 });
    }
  }, [loading]);

  const handleStart = async () => {
    await startWorkout(routine);

    router.back();
    router.push("/(modals)/workout");
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={() => router.back()}>
        <BlurView intensity={40} style={styles.blurView} />
      </TouchableWithoutFeedback>

      {routine && (
        <Animated.View
          key={routine.id}
          style={[styles.card, { backgroundColor: colors.card }, animatedStyle]}
        >
          <View style={styles.headerContainer}>
            <ThemedText
              style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}
            >
              {routine.name}
            </ThemedText>

            <ButtonWithIcon onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={colors.text} />
            </ButtonWithIcon>
          </View>

          <ThemedText
            style={{ fontSize: 18, fontWeight: "bold", opacity: 0.6 }}
          >
            Exercises
          </ThemedText>

          {exercises.map((exercise) => (
            <RoutineExerciseView key={exercise.id} exercise={exercise} />
          ))}

          <Button onPress={handleStart} style={{ marginTop: 10 }}>
            Start Workout
          </Button>
        </Animated.View>
      )}
    </View>
  );
};

export default RoutineModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blurView: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    width: "90%",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  item: {
    flexDirection: "row",
    gap: 5,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
