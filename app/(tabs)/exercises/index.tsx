import React, { useState } from "react";
import {
  TextInput,
  Text,
  View,
  Button,
  Alert,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  RectButton,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { withObservables } from "@nozbe/watermelondb/react";
import { Exercise } from "@/models/Exercise";
import database, { exercisesCollection } from "@/db";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import ExerciseList from "@/components/ExerciseList";

function Exercises() {
  const theme = useTheme();

  const renderItem = ({ item }: { item: Exercise }) => {
    return (
      <View
        style={[
          styles.itemContainer,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(modals)/exercise_history",
              params: { exerciseId: item.id, title: item.title },
            })
          }
        >
          <ThemedText style={{ fontSize: 16, fontWeight: 600 }}>
            {item.title}
          </ThemedText>

          <View style={styles.row}>
            <ThemedText style={styles.mgText}>{item.muscleGroup}</ThemedText>
          </View>
        </Pressable>
      </View>
    );
  };

  return <ExerciseList renderItem={renderItem} />;
}

export default Exercises;

const styles = StyleSheet.create({
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 40,
  },
  input: {
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  itemContainer: {
    padding: 10,
    paddingLeft: 20,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
  },
  mgText: {
    fontWeight: 600,
    opacity: 0.6,
  },
});
