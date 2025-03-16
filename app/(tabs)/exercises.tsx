import React, { useState, useEffect } from "react";
import {
  SectionList,
  TextInput,
  Text,
  View,
  SafeAreaView,
  Button,
  Alert,
  StyleSheet,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Exercise } from "@/models/Exercise";
import database from "@/db";

interface Section {
  title: string;
  data: Exercise[];
}

const groupData = (data: Exercise[], recentItems: Exercise[]): Section[] => {
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

  if (recentItems.length > 0) {
    groupedSections.unshift({ title: "Recent", data: recentItems });
  }

  return groupedSections;
};

export default function Exercises() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recent, setRecent] = useState<Exercise[]>([]);
  const [items, setItems] = useState<Exercise[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const exercises = await database
          .get<Exercise>("exercises")
          .query()
          .fetch();
        setItems(exercises);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  const filteredData = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections: Section[] = groupData(filteredData, recent);

  const handleAddItem = () => {
    Alert.prompt(
      "Add Exercise",
      "Enter the name of the new exercise:",
      async (name) => {
        if (name) {
          try {
            await database.write(async () => {
              const newExercise = await database
                .get<Exercise>("exercises")
                .create((exercise: { title: string }) => {
                  exercise.title = name;
                });
              setItems((prev) => [...prev, newExercise]);
            });
          } catch (error) {
            console.error("Failed to add exercise:", error);
          }
        }
      }
    );
  };

  const handleItemPress = (item: Exercise) => {
    setRecent((prev) => {
      const updatedRecent = prev.filter((i) => i.id !== item.id);
      return [item, ...updatedRecent].slice(0, 5);
    });
  };

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
                const exercise = await database
                  .get<Exercise>("exercises")
                  .find(id);
                await exercise.markAsDeleted(); // Soft delete
                setItems((prev) => prev.filter((item) => item.id !== id));
                setRecent((prev) => prev.filter((item) => item.id !== id));
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

    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        translateX.value = Math.max(-100, event.translationX);
      })
      .onEnd(() => {
        if (translateX.value < -50) {
          runOnJS(handleDelete)(item.id);
        }
        translateX.value = withTiming(0);
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
      opacity: withTiming(translateX.value < -50 ? 0 : 1),
    }));

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.itemContainer, animatedStyle]}>
          <Text onPress={() => handleItemPress(item)}>{item.title}</Text>
        </Animated.View>
      </GestureDetector>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={styles.headerText}>Exercises</Text>
        <TextInput
          style={styles.input}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Button title="Add Exercise" onPress={handleAddItem} />
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    marginBottom: 40,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  sectionHeader: {
    backgroundColor: "#eee",
    padding: 5,
  },
  sectionHeaderText: {
    fontWeight: "bold",
  },
  itemContainer: {
    padding: 10,
    backgroundColor: "#fff",
  },
});
