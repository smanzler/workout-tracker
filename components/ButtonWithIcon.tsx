import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Button from "./Button";
import { useTheme } from "@react-navigation/native";

const ButtonWithIcon = ({
  onPress,
  children,
}: {
  onPress?: () => void;
  children: React.ReactNode;
}) => {
  const { colors } = useTheme();
  return (
    <Button
      style={{
        height: 26,
        paddingHorizontal: 10,
        backgroundColor: colors.text
          .replace("rgb", "rgba")
          .replace(")", ", 0.1)"),
      }}
      onPress={onPress}
    >
      {children}
    </Button>
  );
};

export default ButtonWithIcon;

const styles = StyleSheet.create({});
