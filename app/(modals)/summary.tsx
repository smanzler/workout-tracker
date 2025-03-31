import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "@react-navigation/native";
import WorkoutListItem from "@/components/WorkoutListItem";
import { workoutsCollection } from "@/db";
import { useWorkout } from "@/providers/WorkoutProvider";
import { router, useLocalSearchParams } from "expo-router";
import { Workout } from "@/models/Workout";
import { Ionicons } from "@expo/vector-icons";

const Summary = () => {
  const theme = useTheme();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [workout, setWorkout] = useState<Workout>();

  useEffect(() => {
    const loadWorkout = async () => {
      if (workoutId) {
        setWorkout(await workoutsCollection.find(workoutId));
      }
    };

    loadWorkout();
  }, [workoutId]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.colors.text }]}>
          Congratulations!
        </Text>

        {workout && <WorkoutListItem workout={workout} />}
      </View>
    </SafeAreaView>
  );
};

export default Summary;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
    margin: 20,
  },
});
