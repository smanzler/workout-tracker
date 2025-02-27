import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Workout } from "@/app/(tabs)/start_workout";

const WorkoutList = ({ data }: { data: Workout[] }) => {
  return (
    <View>
      {data.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text>{item.workouts.join(", ")}</Text>
        </View>
      ))}
    </View>
  );
};

export default WorkoutList;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderColor: "grey",
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
