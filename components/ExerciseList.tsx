import React, { useEffect, useState } from "react";
import {
  View,
  Button,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { withObservables } from "@nozbe/watermelondb/react";
import { Exercise } from "@/models/Exercise";
import { exercisesCollection, setsCollection } from "@/db";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import ExerciseModal from "@/components/ExerciseModal";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/zeego/drop-down";
import { Ionicons } from "@expo/vector-icons";
import ExerciseSectionList from "./ExerciseSectionList";
import { Set } from "@/models/Set";
import { Q } from "@nozbe/watermelondb";

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

function Exercises({
  exercises,
  onPress,
  selectedItems,
  topBar,
}: {
  exercises: Exercise[];
  onPress: (item: Exercise) => void;
  selectedItems?: Exercise[];
  topBar?: React.JSX.Element;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>(
    []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const theme = useTheme();

  const filteredData = exercises.filter((item) => {
    const matchesQuery = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesMuscle =
      selectedMuscleGroups.length === 0 ||
      selectedMuscleGroups.includes(item.muscleGroup ?? "None");
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.category ?? "None");

    return matchesQuery && matchesMuscle && matchesCategory;
  });

  const sections: Section[] = groupData(filteredData);

  const toggleSelection = (
    value: string,
    current: string[],
    setFn: (v: string[]) => void
  ) => {
    if (current.includes(value)) {
      setFn(current.filter((v) => v !== value));
    } else {
      setFn([...current, value]);
    }
  };

  const fetchPreviousBestSet = async (exerciseId: string) => {
    try {
      const set = await setsCollection
        .query(
          Q.unsafeSqlQuery(
            `
              SELECT * FROM sets
              JOIN workout_exercises ON sets.workout_exercise_id = workout_exercises.id
              WHERE workout_exercises.exercise_id = ?
              ORDER BY sets.weight DESC
              LIMIT 1
            `,
            [exerciseId]
          )
        )
        .unsafeFetchRaw();

      console.log(set);
      return set;
    } catch (error) {
      console.log(error);
      return null;
    }
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
            <View
              style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
            >
              <DropdownMenuRoot>
                <DropdownMenuTrigger>
                  <TouchableOpacity>
                    <Ionicons
                      name="filter"
                      size={24}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger key="muscle-group">
                        <DropdownMenuItemTitle
                          style={{ marginLeft: 8, opacity: 0.6 }}
                        >
                          Muscle Group
                        </DropdownMenuItemTitle>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {[
                          "Chest",
                          "Shoulders",
                          "Arms",
                          "Legs",
                          "Back",
                          "None",
                        ].map((group) => (
                          <DropdownMenuCheckboxItem
                            key={group}
                            value={selectedMuscleGroups.includes(group)}
                            onSelect={() =>
                              toggleSelection(
                                group,
                                selectedMuscleGroups,
                                setSelectedMuscleGroups
                              )
                            }
                          >
                            <DropdownMenuItemTitle>
                              {group}
                            </DropdownMenuItemTitle>
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger key="category">
                        <DropdownMenuItemTitle
                          style={{ marginLeft: 8, opacity: 0.6 }}
                        >
                          Category
                        </DropdownMenuItemTitle>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {[
                          "Barbell",
                          "Dumbbell",
                          "Machine",
                          "Bodyweight",
                          "Assisted Bodyweight",
                          "Reps Only",
                          "Duration",
                          "None",
                        ].map((cat) => (
                          <DropdownMenuCheckboxItem
                            key={cat}
                            value={selectedCategories.includes(cat)}
                            onSelect={() =>
                              toggleSelection(
                                cat,
                                selectedCategories,
                                setSelectedCategories
                              )
                            }
                          >
                            <DropdownMenuItemTitle>{cat}</DropdownMenuItemTitle>
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>

                  <DropdownMenuItem
                    key="reset-filters"
                    destructive
                    onSelect={() => {
                      setSelectedMuscleGroups([]);
                      setSelectedCategories([]);
                    }}
                  >
                    <DropdownMenuItemTitle>Reset Filters</DropdownMenuItemTitle>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuRoot>

              <Button title="New" onPress={() => setVisible(true)} />
            </View>
          ),
        }}
      />

      {topBar}

      <ExerciseSectionList
        sections={sections}
        renderItem={({ item }: { item: Exercise }) => {
          const [previousSet, setPreviousSet] = useState<Set | null>(null);

          useEffect(() => {
            fetchPreviousBestSet(item.id).then((set) =>
              setPreviousSet(set?.[0] ?? null)
            );
          }, []);

          return (
            <TouchableOpacity onPress={() => onPress(item)}>
              <View
                style={[
                  styles.item,
                  selectedItems?.some((i) => i.id === item.id) && {
                    backgroundColor: theme.colors.primary
                      .replace("rgb", "rgba")
                      .replace(")", ", 0.2)"),
                  },
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <ThemedText style={{ fontSize: 16, fontWeight: 600 }}>
                  {item.title}
                </ThemedText>

                <View style={styles.row}>
                  <ThemedText style={styles.mgText}>
                    {item.muscleGroup}
                  </ThemedText>

                  <ThemedText style={styles.mgText}>
                    {previousSet &&
                      `${previousSet.weight} lb x ${previousSet.reps}`}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

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
  item: {
    padding: 10,
    paddingLeft: 20,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mgText: {
    fontWeight: 600,
    opacity: 0.6,
  },
});
