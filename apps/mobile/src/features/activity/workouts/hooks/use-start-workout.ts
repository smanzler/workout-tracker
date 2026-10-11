import { router } from "expo-router";
import { Alert } from "react-native";
import type { Draft } from "../../lib/draft";
import { useWorkoutSessionStore } from "../stores/workout-session-store";

/**
 * Returns a function that starts a workout and opens it. When a workout is
 * in progress, it asks whether to resume that one or replace it.
 */
export const useStartWorkout = () => {
  const start = useWorkoutSessionStore((state) => state.start);

  return (session?: { name: string; exercises: Draft }) => {
    const open = () => router.push("/workout");

    if (useWorkoutSessionStore.getState().startedAt === null) {
      start(session);
      open();
      return;
    }

    Alert.alert(
      "Workout in progress",
      "Resume it, or discard it and start a new one?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Resume", onPress: open },
        {
          text: "Start New",
          style: "destructive",
          onPress: () => {
            start(session);
            open();
          },
        },
      ],
    );
  };
};
