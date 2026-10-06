import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Rep",
  slug: "workout-tracker",
  version: "1.0.8",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "com.sigh10.workouttracker",
  userInterfaceStyle: "automatic",
  platforms: ["ios", "android"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.sigh10.workouttracker",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    predictiveBackGestureEnabled: false,
    package: "com.sigh10.workouttracker",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "Allow $(PRODUCT_NAME) to access your photos",
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
      },
    ],
    "expo-notifications",
    "expo-build-properties",
    "expo-font",
    "expo-web-browser",
    "expo-image",
    "expo-secure-store",
    "expo-sqlite",
    "expo-status-bar",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "c29b1f48-94ff-45d6-9b5c-5ad09b595186",
    },
  },
});
