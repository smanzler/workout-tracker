import { NotificationType } from "../screens/notifications";
import { create } from "zustand";

interface ToastState {
  isVisible: boolean;
  message: NotificationType | null;
  show: (message: NotificationType) => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  isVisible: false,
  message: null,
  show: (message: NotificationType) => set({ isVisible: true, message }),
  hide: () => set({ isVisible: false, message: null }),
}));
