import { Storage } from "expo-sqlite/kv-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Draft } from "../../lib/draft";
import { defaultWorkoutName } from "../lib/workout-name";

type WorkoutSessionStore = {
  startedAt: number | null;
  name: string;
  exercises: Draft;
  start: (session?: { name: string; exercises: Draft }) => void;
  discard: () => void;
  setName: (name: string) => void;
  updateExercises: (update: (exercises: Draft) => Draft) => void;
};

// Sync reads restore a session before the first render.
const sessionStorage = createJSONStorage(() => ({
  getItem: (key: string) => Storage.getItemSync(key),
  setItem: (key: string, value: string) => Storage.setItemSync(key, value),
  removeItem: (key: string) => {
    Storage.removeItemSync(key);
  },
}));

/** The workout in progress. It stays on the device until it is saved. */
export const useWorkoutSessionStore = create<WorkoutSessionStore>()(
  persist(
    (set) => ({
      startedAt: null,
      name: "",
      exercises: [],

      start: (session) => {
        const startedAt = Date.now();
        set({
          startedAt,
          name: session?.name ?? defaultWorkoutName(new Date(startedAt)),
          exercises: session?.exercises ?? [],
        });
      },

      discard: () => set({ startedAt: null, name: "", exercises: [] }),

      setName: (name) => set({ name }),

      updateExercises: (update) =>
        set((state) => ({ exercises: update(state.exercises) })),
    }),
    {
      name: "workout-session",
      storage: sessionStorage,
      partialize: ({ startedAt, name, exercises }) => ({
        startedAt,
        name,
        exercises,
      }),
    },
  ),
);

export const useIsWorkingOut = () =>
  useWorkoutSessionStore((state) => state.startedAt !== null);
