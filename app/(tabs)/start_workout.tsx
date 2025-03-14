import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
import { router, useNavigation } from "expo-router";
import WorkoutList from "@/components/WorkoutList";
import { Entypo } from "@expo/vector-icons";
import { useWorkout } from "@/providers/WorkoutProvider";

export type Workout = {
  id: number;
  title: string;
  workouts: string[];
};

const data: Workout[] = [
  {
    id: 1,
    title: "Legs",
    workouts: ["Squat", "Calf Raises", "Leg Extensions"],
  },
  {
    id: 2,
    title: "Chest and Triceps",
    workouts: ["Bench", "Chest Press", "Arm Pulldowns"],
  },
  {
    id: 3,
    title: "Back and Biceps",
    workouts: ["Deadlift", "Curls"],
  },
  {
    id: 4,
    title: "Abs",
    workouts: ["Crunches", "Planks"],
  },
];

export default function StartWorkoutScreen() {
  const navigation = useNavigation();
  const { startWorkout } = useWorkout();
  const scrollY = useRef(new Animated.Value(0)).current;

  const start = () => {
    router.push("/(modals)/workout");
    startWorkout();
  };

  const textOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Start Workout",
      headerStyle: { backgroundColor: "white", shadowOpacity: textOpacity },
      headerTitleStyle: {
        opacity: textOpacity,
      },
    });
  }, [navigation, textOpacity]);

  return (
    <ScrollView
      style={styles.container}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      <Text style={styles.headerText}>Start Workout</Text>

      <TouchableOpacity style={styles.btn} onPress={start}>
        <Text style={styles.btnText}>Start Workout</Text>
      </TouchableOpacity>

      <View style={styles.templateHeader}>
        <Text style={styles.headerText}>Templates</Text>
        <TouchableOpacity style={styles.templateBtn}>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.templateBtnText}>Template</Text>
            <Entypo name="plus" size={16} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <WorkoutList data={data} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    marginBottom: 40,
  },
  templateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  templateBtn: {
    backgroundColor: "#2ba0d6",
    padding: 10,
    borderRadius: 8,
  },
  templateBtnText: {
    fontWeight: "bold",
    color: "white",
  },
  btn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#2ba0d6",
    marginBottom: 50,
  },
  btnText: {
    textAlign: "center",
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
