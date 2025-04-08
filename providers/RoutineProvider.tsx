import React, { createContext, useContext, useEffect, useState } from "react";
import { Routine } from "@/models/Routine";
import AsyncStorage from "@react-native-async-storage/async-storage";
import database, { routinesCollection } from "@/db";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "./AuthProvider";

interface RoutineContextType {
  activeRoutineId: string | undefined;
  createRoutine: (routine?: Routine) => Promise<void>;
  deleteRoutine: () => Promise<void>;
  saveRoutine: (routineName?: string) => Promise<void>;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export const RoutineProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeRoutineId, setActiveRoutineId] = useState<string | undefined>(
    undefined
  );
  const { user } = useAuth();

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        const storedRoutineId = await AsyncStorage.getItem("activeRoutineId");
        if (storedRoutineId) {
          setActiveRoutineId(storedRoutineId);
        }
      } catch (error) {
        console.log("Unable to fetch active routine: ", error);
      }
    };

    loadRoutine();
  }, []);

  const createRoutine = async () => {
    try {
      if (activeRoutineId) {
        await deleteRoutine();
      }
      database.write(async () => {
        const { id } = await routinesCollection.create((r) => {
          user && (r.userId = user.id);
        });
        await AsyncStorage.setItem("activeRoutineId", id);
        setActiveRoutineId(id);
      });
    } catch (error) {
      console.log("Error creating routine", error);
    }
  };

  const deleteRoutine = async () => {
    try {
      if (!activeRoutineId) {
        return;
      }
      database.write(async () => {
        const routine = await routinesCollection.find(activeRoutineId);
        const routineExercises = await routine.routineExercises.fetch();

        const setsToDelete = await Promise.all(
          routineExercises.map((re) => re.routineSets.fetch())
        );

        const routineExerciseDeletions = await Promise.all(
          routineExercises.map((re) => re.markAsDeleted())
        );
        const routineSetDeletions = await Promise.all(
          setsToDelete.flat().map((set) => set.markAsDeleted())
        );
        const routineDeletion = await routine.markAsDeleted();

        const batchOps = [
          ...routineExerciseDeletions,
          ...routineSetDeletions,
          routineDeletion,
        ];

        await database.batch(...batchOps);

        await AsyncStorage.removeItem("activeRoutineId");
        setActiveRoutineId(undefined);
      });
    } catch (error) {
      console.log("Error deleting Routine", error);
    }
  };

  const saveRoutine = async (routineName?: string) => {
    if (!activeRoutineId) {
      return;
    }

    try {
      const routine = await routinesCollection.find(activeRoutineId);
      const re = await routine.routineExercises.fetch();
      if (re.length === 0) {
        Alert.alert("Add Exercises", "Add exercises to the routine to save it");
        return;
      }

      await database.write(async () => {
        routine.update((r) => {
          r.name = routineName || "New Routine";
        });
      });

      await AsyncStorage.removeItem("activeRoutineId");
      setActiveRoutineId(undefined);

      router.back();
    } catch (error) {
      console.error("Failed to save routine:", error);
      return;
    }
  };

  return (
    <RoutineContext.Provider
      value={{ activeRoutineId, createRoutine, deleteRoutine, saveRoutine }}
    >
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutine = () => {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error("useRoutine must be used within a RoutineProvider");
  }
  return context;
};
