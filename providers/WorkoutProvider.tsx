import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import database, { setsCollection, workoutExercisesCollection } from "@/db";
import { Workout } from "@/models/Workout";
import { useAuth } from "./AuthProvider";
import { Routine } from "@/models/Routine";
import dayjs from "dayjs";

interface WorkoutContextType {
  seconds: number;
  activeWorkoutId: string | undefined;
  isLoading: boolean;
  startWorkout: (routine?: Routine) => Promise<void>;
  stopWorkout: (workoutName?: string) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [startTime, setStartTime] = useState<number | undefined>(undefined);
  const [now, setNow] = useState(() => Date.now());
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | undefined>(
    undefined
  );
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // JS timers stop in the background, so count from the start time.
  useEffect(() => {
    if (startTime === undefined) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const seconds =
    startTime === undefined
      ? 0
      : Math.max(0, Math.floor((now - startTime) / 1000));

  const loadStartTime = async () => {
    try {
      const storedWorkoutId = await AsyncStorage.getItem("activeWorkoutId");
      if (storedWorkoutId) {
        setActiveWorkoutId(storedWorkoutId);

        const workout = await database
          .get<Workout>("workouts")
          .find(storedWorkoutId);
        if (workout && workout.startTime) {
          setStartTime(workout.startTime);
        }
      }
    } catch (error) {
      console.error("Failed to load workout start time", error);
    }
  };

  useEffect(() => {
    loadStartTime();
  }, []);

  const startWorkout = async (routine?: Routine) => {
    setIsLoading(true);

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

              const setOps = routineSets.map((routineSet, index) => {
                return setsCollection.prepareCreate((set) => {
                  // @ts-ignore
                  set.workoutExercise.set(workoutExercise);
                  set.reps = routineSet.reps;
                  set.weight = routineSet.weight;
                  set.position = index + 1;
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
      setStartTime(newWorkout.startTime);
    } catch (error) {
      console.error("Failed to start workout", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopWorkout = async (workoutName?: string) => {
    if (!activeWorkoutId) {
      console.log("No active workout to stop");
      return;
    }

    setIsLoading(true);

    try {
      await database.write(async () => {
        const workout = await database
          .get<Workout>("workouts")
          .find(activeWorkoutId);
        if (workout) {
          workout.update((w) => {
            w.endTime = Date.now();
            w.name = workoutName || `${dayjs().format("MMM D")} Workout`;
          });
        }
      });
      await AsyncStorage.removeItem("activeWorkoutId");
      setActiveWorkoutId(undefined);
      setStartTime(undefined);
    } catch (error) {
      console.error("Failed to stop workout", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WorkoutContext.Provider
      value={{ seconds, activeWorkoutId, startWorkout, stopWorkout, isLoading }}
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
