import { create } from "zustand";
import type { Draft } from "../../lib/draft";

type RoutineDraftStore = {
  name: string;
  exercises: Draft;
  setName: (name: string) => void;
  updateExercises: (update: (exercises: Draft) => Draft) => void;
  reset: () => void;
};

/** The routine that the user is creating. */
export const useRoutineDraftStore = create<RoutineDraftStore>((set) => ({
  name: "",
  exercises: [],

  setName: (name) => set({ name }),

  updateExercises: (update) =>
    set((state) => ({ exercises: update(state.exercises) })),

  reset: () => set({ name: "", exercises: [] }),
}));
