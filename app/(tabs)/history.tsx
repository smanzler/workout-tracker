import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Workout } from "@/models/Workout";
import WorkoutList from "@/components/WorkoutList";

const History = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={styles.headerText}>History</Text>
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
    color: "black",
    marginBottom: 40,
  },
});
