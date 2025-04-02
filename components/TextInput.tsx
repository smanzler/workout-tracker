import { useTheme } from "@react-navigation/native";
import React from "react";
import {
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { ThemedText } from "./ThemedText";

type InputVariant = "default" | "filled" | "outlined" | "ghost";
type InputSize = "sm" | "md" | "lg";

interface TextInputProps extends Omit<RNTextInputProps, "style"> {
  label?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  variant = "default",
  size = "md",
  containerStyle,
  inputStyle,
  disabled = false,
  ...props
}) => {
  const sizeStyles: Record<
    InputSize,
    { height?: number; fontSize: number; padding: number }
  > = {
    sm: { fontSize: 16, padding: 8 },
    md: { height: 50, fontSize: 16, padding: 14 },
    lg: { height: 55, fontSize: 32, padding: 16 },
  };

  const theme = useTheme();

  const getVariantStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      backgroundColor: theme.colors.background,
    };

    switch (variant) {
      case "filled":
        return {
          ...baseStyle,
          backgroundColor: theme.colors.card,
        };
      case "outlined":
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.card,
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return theme.colors.text;
    }
    return theme.colors.text;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <View style={[getVariantStyle(), disabled && styles.disabled]}>
        <RNTextInput
          style={[
            {
              height: sizeStyles[size].height,
              fontSize: sizeStyles[size].fontSize,
              padding: sizeStyles[size].padding,
              color: getTextColor(),
            },
            inputStyle,
          ]}
          placeholderTextColor={theme.colors.text}
          editable={!disabled}
          {...props}
        />
      </View>
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
  },
  error: {
    color: "#ef4444", // red-500
    marginTop: 4,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default TextInput;
