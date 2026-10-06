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
import { Workout } from "@/db/models/workout";
import { BlurView } from "expo-blur";
import { useTheme } from "expo-router/react-navigation";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/db/models/workout-exercise";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import Button from "@/components/button";
import { router, useLocalSearchParams } from "expo-router";
import { routinesCollection, workoutsCollection } from "@/db";
import dayjs from "dayjs";
import { Set } from "@/db/models/set";
import WorkoutModalWorkoutExercise from "@/features/activity/workouts/components/workout-modal-workout-exercise";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Exercise } from "@/db/models/exercise";
import { Routine } from "@/db/models/routine";
import RoutineExerciseView from "../components/routine-exercise-view";
import { useWorkout } from "@/providers/workout-provider";
import ButtonWithIcon from "@/features/activity/components/button-with-icon";
import { RoutineExercise } from "@/db/models/routine-exercise";
import Divider from "@/components/divider";

const RoutineModal = () => {
  const { colors } = useTheme();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const [routine, setRoutine] = useState<Routine | undefined>(undefined);
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>(
    [],
  );
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
      setRoutineExercises(rExercises);

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
              type="title"
              style={{ marginBottom: 10, flexShrink: 1 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {routine.name}
            </ThemedText>

            <ButtonWithIcon onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={colors.text} />
            </ButtonWithIcon>
          </View>

          {routineExercises.map((re, index) => (
            <React.Fragment key={re.id}>
              <RoutineExerciseView routineExercise={re} />
              {index < routineExercises.length - 1 && <Divider />}
            </React.Fragment>
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
