import {
  Alert,
  Button,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Exercise } from "../(tabs)/exercises";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Section {
  title: string;
  data: Exercise[];
}

const groupData = (data: Exercise[], recentItems: Exercise[]): Section[] => {
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

export default function Add_Exercise() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recent, setRecent] = useState<Exercise[]>([]);
  const [items, setItems] = useState<Exercise[]>([]);
  const [selectedItems, setSelectedItems] = useState<Exercise[]>([]);

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

  const handleItemPress = (item: Exercise) => {
    setSelectedItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleAddToWorkout = () => {
    if (selectedItems.length === 0) return;

    setRecent((prev) => {
      const updatedRecent = [
        ...selectedItems,
        ...prev.filter((i) => !selectedItems.some((s) => s.id === i.id)),
      ].slice(0, 5);
      return updatedRecent;
    });

    setSelectedItems([]);
  };

  const handleAddItem = () => {
    Alert.prompt("Add Item", "Enter the name of the new item:", (name) => {
      if (name.trim()) {
        const newExercise: Exercise = {
          id: Date.now().toString(),
          name: name.trim(),
        };
        setItems((prev) => [...prev, newExercise]);
      }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={handleAddToWorkout}
          disabled={selectedItems.length === 0}
        >
          <Text
            style={[
              styles.addButton,
              selectedItems.length === 0 && styles.disabled,
            ]}
          >
            Add to Workout ({selectedItems.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        <TextInput
          style={styles.input}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <Button title="Add Item" onPress={handleAddItem} />

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleItemPress(item)}>
              <View
                style={[
                  styles.item,
                  selectedItems.some((i) => i.id === item.id) &&
                    styles.selectedItem,
                ]}
              >
                <Text>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  addButton: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "600",
  },
  disabled: {
    color: "#ccc",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  item: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  selectedItem: {
    backgroundColor: "#d4edda",
  },
  sectionHeader: {
    padding: 5,
    backgroundColor: "#eee",
  },
  sectionTitle: {
    fontWeight: "bold",
  },
});
