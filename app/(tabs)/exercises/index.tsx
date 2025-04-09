import React, { useState } from "react";
import {
  TextInput,
  Text,
  View,
  Button,
  Alert,
  StyleSheet,
  Pressable,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
import ExercisesList from "@/components/ExercisesList";
import { useAuth } from "@/providers/AuthProvider";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import { router, Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import ExerciseModal from "@/components/ExerciseModal";

interface Section {
  title: string;
  data: Exercise[];
}

const groupData = (data: Exercise[]): Section[] => {
  const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
  const sections: Record<string, Section> = {};

  sorted.forEach((item) => {
    const firstLetter = item.title[0].toUpperCase();
    if (!sections[firstLetter]) {
      sections[firstLetter] = { title: firstLetter, data: [] };
    }
    sections[firstLetter].data.push(item);
  });

  const groupedSections = Object.values(sections);

  return groupedSections;
};

function Exercises({ exercises }: { exercises: Exercise[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  const { user } = useAuth();

  const filteredData = exercises.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections: Section[] = groupData(filteredData);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Exercise",
      "Are you sure you want to delete this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await database.write(async () => {
                const exercise = await exercisesCollection.find(id);
                await exercise.markAsDeleted();
              });
            } catch (error) {
              console.error("Failed to delete exercise:", error);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Exercise }) => {
    const translateX = useSharedValue(0);
    const id = item.id;

    const panGesture = Gesture.Pan()
      .failOffsetY([-5, 5])
      .activeOffsetX([-10, 10])
      .onUpdate((event) => {
        translateX.value = Math.max(-100, event.translationX);
      })
      .onEnd(() => {
        if (translateX.value < -50) {
          runOnJS(handleDelete)(id);
        }
        translateX.value = withTiming(0);
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
      opacity: withTiming(translateX.value < -50 ? 0 : 1),
    }));

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.itemContainer,
            animatedStyle,
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
        </Animated.View>
      </GestureDetector>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: "Search",
            onChangeText: (e) => {
              setSearchQuery(e.nativeEvent.text);
            },
          },
          headerRight: () => (
            <Button title="New" onPress={() => setVisible(true)} />
          ),
        }}
      />
      <ExercisesList sections={sections} renderItem={renderItem} />

      <ExerciseModal visible={visible} setVisible={setVisible} />
    </>
  );
}

const enhance = withObservables([], () => ({
  exercises: exercisesCollection.query(),
}));

export default enhance(Exercises);

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
