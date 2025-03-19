import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import BackgroundTimer from "react-native-background-timer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import database from "@/db";
import { Workout } from "@/models/Workout";

interface WorkoutContextType {
  seconds: number;
  activeWorkoutId: string | undefined;
  startWorkout: () => Promise<void>;
  stopWorkout: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | undefined>(
    undefined
  );
  const appState = useRef(AppState.currentState);

  const startTimer = () => {
    if (!timerRef.current) {
      timerRef.current = BackgroundTimer.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = async () => {
    if (timerRef.current) {
      BackgroundTimer.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const loadStartTime = async () => {
    try {
      const storedWorkoutId = await AsyncStorage.getItem("activeWorkoutId");
      if (storedWorkoutId) {
        setActiveWorkoutId(storedWorkoutId);

        const workout = await database
          .get<Workout>("workouts")
          .find(storedWorkoutId);
        if (workout && workout.startTime) {
          const elapsed = Math.floor((Date.now() - workout.startTime) / 1000);
          setSeconds(elapsed);
          startTimer();
        }
      }
    } catch (error) {
      console.error("Failed to load workout start time", error);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current === "active" && nextAppState === "background") {
      startTimer();
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    loadStartTime();

    const appStateListener = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      stopTimer();
      appStateListener.remove();
    };
  }, []);

  const startWorkout = async () => {
    try {
      const newWorkout = await database.write(async () => {
        const workout = await database
          .get<Workout>("workouts")
          .create((workout) => {
            workout.startTime = Date.now();
          });
        return workout;
      });

      await AsyncStorage.setItem("activeWorkoutId", newWorkout.id);
      setActiveWorkoutId(newWorkout.id);
      setSeconds(0);
      startTimer();
    } catch (error) {
      console.error("Failed to start workout", error);
    }
  };

  const stopWorkout = async () => {
    try {
      const activeWorkoutId = await AsyncStorage.getItem("activeWorkoutId");
      if (activeWorkoutId) {
        await database.write(async () => {
          const workout = await database
            .get<Workout>("workouts")
            .find(activeWorkoutId);
          if (workout) {
            workout.endTime = Date.now();
          }
        });
        await AsyncStorage.removeItem("activeWorkoutId");
        setActiveWorkoutId(undefined);
      }

      stopTimer();
      setSeconds(0);
    } catch (error) {
      console.error("Failed to stop workout", error);
    }
  };

  return (
    <WorkoutContext.Provider
      value={{ seconds, activeWorkoutId, startWorkout, stopWorkout }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};
