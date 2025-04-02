import { StyleSheet } from "react-native";
import React from "react";
import WorkoutList from "@/components/WorkoutList";
import { BodyScrollView } from "@/components/BodyScrollViiew";

const History = () => {
  return (
    <BodyScrollView style={{ paddingHorizontal: 20 }}>
      <WorkoutList />
    </BodyScrollView>
  );
};

export default History;

const styles = StyleSheet.create({});
