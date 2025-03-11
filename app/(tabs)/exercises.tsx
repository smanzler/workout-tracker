import React, { useState, useEffect } from "react";
import {
  SectionList,
  TextInput,
  Text,
  View,
  SafeAreaView,
  Button,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

interface Item {
  id: string;
  name: string;
}

interface Section {
  title: string;
  data: Item[];
}

const groupData = (data: Item[], recentItems: Item[]): Section[] => {
  const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
  const sections: Record<string, Section> = {};

  sorted.forEach((item) => {
    const firstLetter = item.name[0].toUpperCase();
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
  const [recent, setRecent] = useState<Item[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedItems = await AsyncStorage.getItem("items");
        const storedRecent = await AsyncStorage.getItem("recent");
        if (storedItems) setItems(JSON.parse(storedItems));
        if (storedRecent) setRecent(JSON.parse(storedRecent));
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem("items", JSON.stringify(items));
        await AsyncStorage.setItem("recent", JSON.stringify(recent));
      } catch (error) {
        console.error("Failed to save data:", error);
      }
    };

    saveData();
  }, [items, recent]);

  const filteredData = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections: Section[] = groupData(filteredData, recent);

  const handleItemPress = (item: Item) => {
    setRecent((prev) => {
      const updatedRecent = prev.filter((i) => i.id !== item.id);
      return [item, ...updatedRecent].slice(0, 5);
    });
  };

  const handleAddItem = () => {
    Alert.prompt("Add Item", "Enter the name of the new item:", (name) => {
      if (name.trim()) {
        const newItem: Item = {
          id: Date.now().toString(),
          name: name.trim(),
        };
        setItems((prev) => [...prev, newItem]);
      }
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setItems((prev) => prev.filter((item) => item.id !== id));
          setRecent((prev) => prev.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Item }) => {
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
        <Animated.View
          style={[{ padding: 10, backgroundColor: "#fff" }, animatedStyle]}
        >
          <Text onPress={() => handleItemPress(item)}>{item.name}</Text>
        </Animated.View>
      </GestureDetector>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <TextInput
          style={{
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            marginBottom: 10,
            paddingHorizontal: 10,
            borderRadius: 5,
          }}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Button title="Add Item" onPress={handleAddItem} />
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <View style={{ backgroundColor: "#eee", padding: 5 }}>
              <Text style={{ fontWeight: "bold" }}>{title}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
