import { useTheme } from "expo-router/react-navigation";
import { View, type ViewProps } from "react-native";

export function ThemedView({ style, ...otherProps }: ViewProps) {
  const {
    colors: { background: backgroundColor },
  } = useTheme();

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
