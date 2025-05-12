// hooks/usePushNotifications.ts
import { useState, useEffect } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { uploadPushToken } from "@/api/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] =
    useState<Notifications.Notification>();

  async function registerForPushNotificationsAsync(userId: string) {
    let token;

    console.log("registerForPushNotificationsAsync", userId);

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
          throw new Error("Project ID not found");
        }

        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;

        setExpoPushToken(token);

        const tokenUploaded = await AsyncStorage.getItem("tokenUploaded");

        if (!tokenUploaded) {
          await uploadPushToken(token, userId);
        }
      } catch (error) {
        console.error("Error getting/uploading push token:", error);
      }
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    return token;
  }

  return {
    expoPushToken,
    notification,
    registerForPushNotificationsAsync,
  };
}
