import { StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
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
    <TouchableOpacity
      style={{
        borderRadius: 10,
        height: 25,
        justifyContent: "center",
        paddingHorizontal: 10,
        backgroundColor: colors.text
          .replace("rgb", "rgba")
          .replace(")", ", 0.1)"),
      }}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
};

export default ButtonWithIcon;

const styles = StyleSheet.create({});
