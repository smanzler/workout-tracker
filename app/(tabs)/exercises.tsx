import React, { useState } from "react";
import { SectionList, TextInput, Text, View } from "react-native";

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

const groupData = (data: Item[]): Section[] => {
  const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
  const sections: Record<string, Section> = {};

  sorted.forEach((item) => {
    const firstLetter = item.name[0].toUpperCase();
    if (!sections[firstLetter]) {
      sections[firstLetter] = { title: firstLetter, data: [] };
    }
    sections[firstLetter].data.push(item);
  });

  return Object.values(sections);
};

export default function Exercises() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = rawData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections: Section[] = groupData(filteredData);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 10,
          paddingHorizontal: 10,
        }}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Text>{item.name}</Text>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ backgroundColor: "#eee", padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>{title}</Text>
          </View>
        )}
      />
    </View>
  );
}
