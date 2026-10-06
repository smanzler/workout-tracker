import {
  DarkTheme,
  DefaultTheme,
  type Theme,
} from "expo-router/react-navigation";

// The palette of src/global.css as rgb() strings, because the StyleSheet
// screens add an alpha to these strings.
export const NAV_THEME: Record<"light" | "dark", Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: "rgb(255, 255, 255)",
      border: "rgb(229, 229, 229)",
      card: "rgb(255, 255, 255)",
      notification: "rgb(239, 68, 68)",
      primary: "rgb(23, 23, 23)",
      text: "rgb(10, 10, 10)",
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: "rgb(10, 10, 10)",
      border: "rgb(38, 38, 38)",
      card: "rgb(10, 10, 10)",
      notification: "rgb(225, 78, 78)",
      primary: "rgb(250, 250, 250)",
      text: "rgb(250, 250, 250)",
    },
  },
};
