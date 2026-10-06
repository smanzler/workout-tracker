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

/** Sends the push token of this device. Onboarding asks for the permission. */
export const usePushNotificationRegistration = () => {
  const { mutate: registerToken } = useRegisterPushToken();

  useEffect(() => {
    getPushToken().then((token) => {
      if (token) registerToken({ token });
    });
  }, [registerToken]);
};
