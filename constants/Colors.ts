import { Theme } from "@react-navigation/native";

export const DarkTheme: Theme = {
  colors: {
    background: "rgb(1, 1, 1)",
    border: "rgb(39, 39, 41)",
    card: "rgb(24, 24, 24)",
    notification: "rgb(255, 69, 58)",
    primary: "rgb(10, 132, 255)",
    text: "rgb(229, 229, 231)",
  },
  dark: true,
  fonts: {
    bold: { fontFamily: "System", fontWeight: "600" },
    heavy: { fontFamily: "System", fontWeight: "700" },
    medium: { fontFamily: "System", fontWeight: "500" },
    regular: { fontFamily: "System", fontWeight: "400" },
  },
};

export const DefaultTheme: Theme = {
  colors: {
    background: "rgb(242, 242, 242)",
    border: "rgb(216, 216, 216)",
    card: "rgb(255, 255, 255)",
    notification: "rgb(255, 59, 48)",
    primary: "rgb(0, 122, 255)",
    text: "rgb(28, 28, 30)",
  },
  dark: false,
  fonts: {
    bold: { fontFamily: "System", fontWeight: "600" },
    heavy: { fontFamily: "System", fontWeight: "700" },
    medium: { fontFamily: "System", fontWeight: "500" },
    regular: { fontFamily: "System", fontWeight: "400" },
  },
};
