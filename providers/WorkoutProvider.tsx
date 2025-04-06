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
import database, { setsCollection, workoutExercisesCollection } from "@/db";
import { Workout } from "@/models/Workout";
import { useAuth } from "./AuthProvider";
import { Routine } from "@/models/Routine";

interface WorkoutContextType {
  seconds: number;
  activeWorkoutId: string | undefined;
  startWorkout: (routine?: Routine) => Promise<void>;
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
  const { user } = useAuth();

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

  const startWorkout = async (routine?: Routine) => {
    try {
      const newWorkout = await database.write(async () => {
        const workout = await database
          .get<Workout>("workouts")
          .create((workout) => {
            workout.startTime = Date.now();
            user && (workout.userId = user.id);
          });

        if (routine) {
          const routineExercises = await routine.routineExercises.fetch();

          const batchOps = await Promise.all(
            routineExercises.map(async (routineExercise) => {
              const routineSets = await routineExercise.routineSets.fetch();

              const workoutExercise = workoutExercisesCollection.prepareCreate(
                (workoutExercise) => {
                  // @ts-ignore
                  workoutExercise.exercise.set(routineExercise.exercise);
                  // @ts-ignore
                  workoutExercise.workout.set(workout);
                  user && (workoutExercise.userId = user.id);
                }
              );

              const setOps = routineSets.map((routineSet) => {
                return setsCollection.prepareCreate((set) => {
                  // @ts-ignore
                  set.workoutExercise.set(workoutExercise);
                  set.workoutStartTime = workout.startTime;
                  set.reps = routineSet.reps;
                  set.weight = routineSet.weight;
                  user && (set.userId = user.id);
                });
              });

              return [workoutExercise, ...setOps];
            })
          );

          await database.batch(...batchOps.flat());
        }

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
    if (!activeWorkoutId) {
      console.log("No active workout to stop");
      return;
    }

    try {
      await database.write(async () => {
        const workout = await database
          .get<Workout>("workouts")
          .find(activeWorkoutId);
        if (workout) {
          workout.update((w) => {
            w.endTime = Date.now();
          });
        }
      });
      await AsyncStorage.removeItem("activeWorkoutId");
      setActiveWorkoutId(undefined);

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
