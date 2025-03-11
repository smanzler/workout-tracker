import React, { useState } from "react";
import {
  SectionList,
  TextInput,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

interface Item {
  id: string;
  name: string;
}

interface Section {
  title: string;
  data: Item[];
}

const rawData: Item[] = [
  { id: "1", name: "Apple" },
  { id: "2", name: "Avocado" },
  { id: "3", name: "Banana" },
  { id: "4", name: "Blueberry" },
  { id: "5", name: "Cherry" },
  { id: "6", name: "Date" },
];

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

  const filteredData = rawData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections: Section[] = groupData(filteredData, recent);

  const handleItemPress = (item: Item) => {
    setRecent((prev) => {
      const updatedRecent = prev.filter((i) => i.id !== item.id);
      return [item, ...updatedRecent].slice(0, 5);
    });
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
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleItemPress(item)}>
              <View style={{ padding: 10 }}>
                <Text>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
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
