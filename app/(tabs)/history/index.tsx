import { StyleSheet } from "react-native";
import React from "react";
import WorkoutList from "@/components/WorkoutList";
import { useTheme } from "@react-navigation/native";
import { BodyScrollView } from "@/components/BodyScrollViiew";

const History = () => {
  const theme = useTheme();

  return (
    <BodyScrollView>
      <WorkoutList />
    </BodyScrollView>
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
