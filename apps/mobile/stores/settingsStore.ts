import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJSONStorage, persist } from "zustand/middleware";

type SettingsActions = {
  setShowExploreTab: (show: boolean) => void;
};

type Settings = {
  showExploreTab: boolean;
  actions: SettingsActions;
};

const useSettingsStore = create<Settings>()(
  persist(
    (set) => ({
      showExploreTab: true,
      actions: {
        setShowExploreTab: (show) => set({ showExploreTab: show }),
      },
    }),
    {
      name: "app-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useSettings = () =>
  useSettingsStore((state) => state.showExploreTab);

export const useSettingsActions = () =>
  useSettingsStore((state) => state.actions);
