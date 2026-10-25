import type { ConfigContext, ExpoConfig } from "expo/config";
import "dotenv/config";

const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Google sign-in on iOS opens the app with the reversed client ID.
const reverseClientId = (clientId: string) =>
  clientId.split(".").reverse().join(".");

const fontWeights = {
  400: "Regular",
  500: "Medium",
  600: "SemiBold",
  700: "Bold",
};

const buildFontFamily = (fontFamily: string) => {
  const name = fontFamily.replaceAll(" ", "");
  const slug = fontFamily.toLowerCase().replaceAll(" ", "-");
  return {
    fontFamily,
    fontDefinitions: Object.entries(fontWeights).map(([weight, label]) => ({
      path: `./node_modules/@expo-google-fonts/${slug}/${weight}${label}/${name}_${weight}${label}.ttf`,
      weight: Number(weight),
    })),
  };
};

// Keep the family names the same as --font-sans and --font-mono in global.css
// and the navigation fonts in src/lib/theme.ts.
const fontFamilies = ["IBM Plex Sans", "IBM Plex Mono"].map(buildFontFamily);

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
      monochromeImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#f8f9fa",
    },
    predictiveBackGestureEnabled: false,
    package: "com.sigh10.workouttracker",
    // Play rejects a version code that it has. `fastlane android release` sets it.
    versionCode: Number(process.env.ANDROID_VERSION_CODE ?? 1),
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
    [
      "expo-font",
      {
        // iOS gets the family name from each file.
        ios: {
          fonts: fontFamilies.flatMap(({ fontDefinitions }) =>
            fontDefinitions.map(({ path }) => path),
          ),
        },
        android: { fonts: fontFamilies },
      },
    ],
    "expo-web-browser",
    "expo-image",
    "expo-secure-store",
    "expo-sqlite",
    "expo-status-bar",
    "./plugins/with-upload-signing",
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
