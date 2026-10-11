import { router } from "expo-router";
import { Alert } from "react-native";
import {
  hasIncompleteSets,
  keepCompletedSets,
  toExerciseInputs,
} from "../../lib/draft";
import { defaultWorkoutName } from "../lib/workout-name";
import { useWorkoutSessionStore } from "../stores/workout-session-store";
import { useCreateWorkout } from "./use-create-workout";

/**
 * Returns `finish`, which asks to confirm, saves the done sets of the workout
 * in progress and opens its summary. When the save fails, the workout stays
 * on the device.
 */
export const useFinishWorkout = () => {
  const { mutate: createWorkout, isPending } = useCreateWorkout();

  const save = () => {
    const { startedAt, name, exercises, discard } =
      useWorkoutSessionStore.getState();
    if (startedAt === null) return;

    createWorkout(
      {
        name: name.trim() || defaultWorkoutName(new Date(startedAt)),
        startedAt,
        // The device clock can go back during a workout.
        endedAt: Math.max(startedAt, Date.now()),
        exercises: toExerciseInputs(keepCompletedSets(exercises)),
      },
      {
        onSuccess: ({ workoutId }) => {
          router.replace({
            pathname: "/workout-summary",
            params: { workoutId },
          });
          discard();
        },
        onError: () =>
          Alert.alert(
            "Could not save workout",
            "Try again in a moment. The workout stays on this device.",
          ),
      },
    );
  };

  const finish = () => {
    const { exercises } = useWorkoutSessionStore.getState();

    if (keepCompletedSets(exercises).length === 0) {
      Alert.alert(
        "No sets done",
        "Mark at least one set as done to save this workout.",
      );
      return;
    }

    Alert.alert(
      "Finish workout?",
      hasIncompleteSets(exercises)
        ? "Sets that are not marked done will not be saved."
        : undefined,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Finish", onPress: save },
      ],
    );
  };

  return { finish, isPending };
};
