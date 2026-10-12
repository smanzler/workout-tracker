import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { getPushToken } from "../lib/push-token";
import { useRegisterPushToken } from "./use-register-push-token";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Returns a function that sends the push token of this device, if it has one. */
export const useRegisterDevice = () => {
  const { mutate: registerToken } = useRegisterPushToken();

  return async () => {
    const token = await getPushToken();
    if (token) registerToken({ token });
  };
};

/** Sends the push token of this device. Onboarding asks for the permission. */
export const usePushNotificationRegistration = () => {
  const registerDevice = useRegisterDevice();

  useEffect(() => {
    registerDevice();
  }, [registerDevice]);
};
