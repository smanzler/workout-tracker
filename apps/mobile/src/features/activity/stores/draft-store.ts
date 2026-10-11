import { create } from "zustand";
import type { Draft } from "../lib/draft";

type DraftStore = {
  name: string;
  exercises: Draft;
  load: (draft: { name: string; exercises: Draft }) => void;
  setName: (name: string) => void;
  updateExercises: (update: (exercises: Draft) => Draft) => void;
  reset: () => void;
};

/**
 * Makes a store for a named draft that an editor screen and the exercise
 * picker share.
 */
export const createDraftStore = () =>
  create<DraftStore>((set) => ({
    name: "",
    exercises: [],

    load: ({ name, exercises }) => set({ name, exercises }),

    setName: (name) => set({ name }),

    updateExercises: (update) =>
      set((state) => ({ exercises: update(state.exercises) })),

    reset: () => set({ name: "", exercises: [] }),
  }));
