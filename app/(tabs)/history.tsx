import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Workout } from "@/models/Workout";
import WorkoutList from "@/components/WorkoutList";
import { useTheme } from "@react-navigation/native";

const History = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.headerText, { color: theme.colors.text }]}>
          History
        </Text>
        <WorkoutList />
      </View>
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    padding: 20,
  },
});
