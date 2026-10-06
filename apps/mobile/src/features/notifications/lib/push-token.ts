import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

/** The Expo push token of this device, or null when it cannot get one. */
export const getPushToken = async () => {
  if (!Device.isDevice) return null;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return null;

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    return data;
  } catch (error) {
    console.warn("Failed to get push token", error);
    return null;
  }
};
