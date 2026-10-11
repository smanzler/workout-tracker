import type { ConfigContext, ExpoConfig } from "expo/config";
import "dotenv/config";

const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Google sign-in on iOS opens the app with the reversed client ID.
const reverseClientId = (clientId: string) =>
  clientId.split(".").reverse().join(".");

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
    usesAppleSignIn: true,
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
    "expo-apple-authentication",
    ...(googleIosClientId
      ? [
          [
            "react-native-nitro-google-signin",
            { iosUrlScheme: reverseClientId(googleIosClientId) },
          ] as [string, unknown],
        ]
      : []),
    "expo-notifications",
    [
      "expo-build-properties",
      {
        ios: {
          // Google sign-in links AppCheckCore, which needs these pods with
          // modular headers. The Google plugin adds them, but only runs with
          // a client ID.
          extraPods: googleIosClientId
            ? []
            : ["AppCheckCore", "GoogleUtilities", "RecaptchaInterop"].map(
                (name) => ({ name, modular_headers: true }),
              ),
        },
      },
    ],
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
