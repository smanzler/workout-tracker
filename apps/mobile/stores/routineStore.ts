import { create } from "zustand";
import { Exercise } from "@/models/Exercise";
import { randomUUID } from "expo-crypto";

export type RoutineSet = {
  id: string;
  reps?: string;
  weight?: string;
};

export type RoutineExercise = {
  exercise: Exercise;
  sets: RoutineSet[];
};

type RoutineActions = {
  addExercises: (exercises: Exercise[]) => void;
  removeExercise: (exerciseIndex: number) => void;
  addSetToExercise: (exerciseIndex: number, set?: RoutineSet) => void;
  updateSetWeight: (
    exerciseIndex: number,
    setIndex: number,
    updatedWeight: string | undefined
  ) => void;
  updateSetReps: (
    exerciseIndex: number,
    setIndex: number,
    updatedReps: string | undefined
  ) => void;
  removeSetAtIndex: (exerciseIndex: number, setIndex: number) => void;
  clearRoutine: () => void;
};

type RoutineState = {
  exercises: RoutineExercise[];
  actions: RoutineActions;
};

const useRoutineStore = create<RoutineState>((set) => ({
  exercises: [],
  actions: {
    addExercises: (newExercises) => {
      const updated = newExercises.map((ex) => ({
        exercise: ex,
        sets: [
          {
            id: randomUUID(),
            reps: undefined,
            weight: undefined,
          },
        ],
      }));
      set((state) => ({
        exercises: [...state.exercises, ...updated],
      }));
    },
    removeExercise: (exerciseIndex) => {
      set((state) => ({
        exercises: state.exercises.filter((_, i) => i !== exerciseIndex),
      }));
    },

    addSetToExercise: (exerciseIndex, setData) => {
      set((state) => ({
        exercises: state.exercises.map((re, i) =>
          i === exerciseIndex
            ? {
                ...re,
                sets: [
                  ...re.sets,
                  {
                    ...(setData ?? {
                      weight: undefined,
                      reps: undefined,
                      id: randomUUID(),
                    }),
                  },
                ],
              }
            : re
        ),
      }));
    },

    updateSetWeight: (exerciseIndex, setIndex, updatedWeight) => {
      set((state) => ({
        exercises: state.exercises.map((re, i) => {
          if (i !== exerciseIndex) return re;
          const updatedSets = re.sets.map((s, j) =>
            j === setIndex - 1 ? { ...s, weight: updatedWeight } : s
          );
          return { ...re, sets: updatedSets };
        }),
      }));
    },

    updateSetReps: (exerciseIndex, setIndex, updatedReps) => {
      set((state) => ({
        exercises: state.exercises.map((re, i) => {
          if (i !== exerciseIndex) return re;
          const updatedSets = re.sets.map((s, j) =>
            j === setIndex - 1 ? { ...s, reps: updatedReps } : s
          );
          return { ...re, sets: updatedSets };
        }),
      }));
    },

    removeSetAtIndex: (exerciseIndex, setIndex) => {
      set((state) => ({
        exercises: state.exercises.map((re, i) => {
          if (i !== exerciseIndex) return re;
          const updatedSets = re.sets.filter((_, j) => {
            return j !== setIndex - 1;
          });
          return { ...re, sets: updatedSets };
        }),
      }));
    },
    clearRoutine: () => {
      set({ exercises: [] });
    },
  },
}));

export const useRoutineExercises = () =>
  useRoutineStore((state) => state.exercises);

export const useRoutineActions = () =>
  useRoutineStore((state) => state.actions);
