import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useTheme } from "@react-navigation/native";

const Divider = () => {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
};

export default Divider;

const styles = StyleSheet.create({
  divider: {
    height: 2,
    width: "100%",
    marginVertical: 5,
  },
});
