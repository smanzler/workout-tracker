import { create } from "zustand";
import { Workout } from "@/models/Workout";
import { Routine } from "@/models/Routine";

type PostActions = {
  setWorkout: (workout: Workout | null) => void;
  setRoutine: (routine: Routine | null) => void;
  clear: () => void;
};

type PostState = {
  selectedWorkout: Workout | null;
  selectedRoutine: Routine | null;
  actions: PostActions;
};

const usePostStore = create<PostState>((set) => ({
  selectedWorkout: null,
  selectedRoutine: null,
  actions: {
    setWorkout: (workout) =>
      set({ selectedWorkout: workout, selectedRoutine: null }),
    setRoutine: (routine) =>
      set({ selectedRoutine: routine, selectedWorkout: null }),
    clear: () =>
      set({
        selectedWorkout: null,
        selectedRoutine: null,
      }),
  },
}));

export const usePostWorkout = () =>
  usePostStore((state) => ({
    selectedWorkout: state.selectedWorkout,
  }));

export const usePostRoutine = () =>
  usePostStore((state) => ({
    selectedWorkout: state.selectedWorkout,
  }));

export const usePostActions = () => usePostStore((state) => state.actions);
