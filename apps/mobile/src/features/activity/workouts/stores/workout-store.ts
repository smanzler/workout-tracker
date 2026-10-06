import { create } from "zustand";
import { Exercise } from "@/db/models/exercise";
import { randomUUID } from "expo-crypto";

export type WorkoutSet = {
  id: string;
  reps?: string;
  weight?: string;
  position: number;
  completed: boolean;
};

export type WorkoutExercise = {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
};

type WorkoutActions = {
  addInitialExercises: (workoutExercises: WorkoutExercise[]) => void;
  addExercises: (exercises: Exercise[]) => void;
  removeExercise: (exerciseIndex: number) => void;
  addSetToExercise: (exerciseIndex: number, set?: WorkoutSet) => void;
  updateSetWeight: (
    exerciseIndex: number,
    setIndex: number,
    updatedWeight: string | undefined,
  ) => void;
  updateSetReps: (
    exerciseIndex: number,
    setIndex: number,
    updatedReps: string | undefined,
  ) => void;
  updateSetCompleted: (
    exerciseIndex: number,
    setIndex: number,
    updatedCompleted: boolean,
  ) => void;
  removeSetAtIndex: (exerciseIndex: number, setIndex: number) => void;
  clearWorkout: () => void;
};

type WorkoutState = {
  exercises: WorkoutExercise[];
  actions: WorkoutActions;
};

const useWorkoutStore = create<WorkoutState>((set) => ({
  exercises: [],
  actions: {
    addInitialExercises: (workoutExercises) => {
      set((state) => ({
        exercises: [...state.exercises, ...workoutExercises],
      }));
    },

    addExercises: (newExercises) => {
      const updated = newExercises.map((ex) => ({
        id: randomUUID(),
        exercise: ex,
        sets: [
          {
            id: randomUUID(),
            reps: undefined,
            weight: undefined,
            position: 1,
            completed: false,
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
                      position: re.sets.length + 1,
                      completed: false,
                    }),
                  },
                ],
              }
            : re,
        ),
      }));
    },

    updateSetWeight: (exerciseIndex, setIndex, updatedWeight) => {
      set((state) => ({
        exercises: state.exercises.map((re, i) => {
          if (i !== exerciseIndex) return re;
          const updatedSets = re.sets.map((s, j) =>
            j === setIndex - 1 ? { ...s, weight: updatedWeight } : s,
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
            j === setIndex - 1 ? { ...s, reps: updatedReps } : s,
          );
          return { ...re, sets: updatedSets };
        }),
      }));
    },

    updateSetCompleted: (exerciseIndex, setIndex, updatedCompleted) => {
      set((state) => ({
        exercises: state.exercises.map((re, i) => {
          if (i !== exerciseIndex) return re;
          const updatedSets = re.sets.map((s, j) =>
            j === setIndex - 1 ? { ...s, completed: updatedCompleted } : s,
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
    clearWorkout: () => {
      set({ exercises: [] });
    },
  },
}));

export const useWorkoutExercises = () =>
  useWorkoutStore((state) => state.exercises);

export const useWorkoutActions = () =>
  useWorkoutStore((state) => state.actions);
