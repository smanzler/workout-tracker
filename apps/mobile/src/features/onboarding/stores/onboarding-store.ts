import { Storage } from "expo-sqlite/kv-store";
import { create } from "zustand";

// The key from before the welcome screen. It is set after the notification
// step, so existing installs skip both steps.
const COMPLETED_KEY = "onboarding-completed";
const WELCOMED_KEY = "onboarding-welcomed";

type OnboardingStore = {
  welcomed: boolean;
  completed: boolean;
  welcome: () => void;
  complete: () => void;
  reset: () => void;
};

const isSet = (key: string) => Storage.getItemSync(key) === "true";

/** The welcome screen shows before sign in; the notification step after the profile. */
export const useOnboardingStore = create<OnboardingStore>((set) => ({
  welcomed: isSet(WELCOMED_KEY) || isSet(COMPLETED_KEY),
  completed: isSet(COMPLETED_KEY),

  welcome() {
    Storage.setItemSync(WELCOMED_KEY, "true");
    set({ welcomed: true });
  },

  complete() {
    Storage.setItemSync(COMPLETED_KEY, "true");
    set({ completed: true });
  },

  reset() {
    Storage.removeItemSync(WELCOMED_KEY);
    Storage.removeItemSync(COMPLETED_KEY);
    set({ welcomed: false, completed: false });
  },
}));
