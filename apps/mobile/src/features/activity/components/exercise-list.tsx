import React, { useEffect, useState } from "react";
import {
  View,
  Button,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { withObservables } from "@nozbe/watermelondb/react";
import { Exercise } from "@/db/models/exercise";
import { exercisesCollection, setsCollection } from "@/db";
import { useTheme } from "expo-router/react-navigation";
import { Stack } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import ExerciseModal from "./exercise-modal";
import { useMenu } from "@/hooks/use-menu";
import { Ionicons } from "@expo/vector-icons";
import ExerciseSectionList from "./exercise-section-list";
import { Set } from "@/db/models/set";
import { Q } from "@nozbe/watermelondb";

const MUSCLE_GROUPS = ["Chest", "Shoulders", "Arms", "Legs", "Back", "None"];

const CATEGORIES = [
  "Barbell",
  "Dumbbell",
  "Machine",
  "Bodyweight",
  "Assisted Bodyweight",
  "Reps Only",
  "Duration",
  "None",
];

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

const fetchPreviousBestSet = async (exerciseId: string) => {
  try {
    const set = await setsCollection
      .query(
        Q.unsafeSqlQuery(
          `
            SELECT * FROM sets
            JOIN workout_exercises ON sets.workout_exercise_id = workout_exercises.id
            JOIN workouts ON workout_exercises.workout_id = workouts.id
            WHERE workout_exercises.exercise_id = ?
              AND sets._status != 'deleted'
              AND workouts.end_time IS NOT NULL
            ORDER BY sets.weight DESC
            LIMIT 1
          `,
          [exerciseId],
        ),
      )
      .unsafeFetchRaw();

    return set;
  } catch (error) {
    console.log(error);
    return null;
  }
};

function ExerciseListItem({
  exercise,
  selected,
  onPress,
}: {
  exercise: Exercise;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const [previousSet, setPreviousSet] = useState<Set | null>(null);

  useEffect(() => {
    fetchPreviousBestSet(exercise.id).then((set) =>
      setPreviousSet(set?.[0] ?? null),
    );
  }, [exercise.id]);

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          styles.item,
          selected && {
            backgroundColor: String(theme.colors.primary)
              .replace("rgb", "rgba")
              .replace(")", ", 0.2)"),
          },
          { borderBottomColor: theme.colors.border },
        ]}
      >
        <ThemedText style={{ fontSize: 16, fontWeight: 600 }}>
          {exercise.title}
        </ThemedText>

        <View style={styles.row}>
          <ThemedText style={styles.mgText}>{exercise.muscleGroup}</ThemedText>

          <ThemedText style={styles.mgText}>
            {previousSet && `${previousSet.weight} lb x ${previousSet.reps}`}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

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
    [],
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const theme = useTheme();
  const showMenu = useMenu();

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
    setFn: (v: string[]) => void,
  ) => {
    if (current.includes(value)) {
      setFn(current.filter((v) => v !== value));
    } else {
      setFn([...current, value]);
    }
  };

  const showFilterOptions = (
    values: string[],
    current: string[],
    setFn: (v: string[]) => void,
  ) =>
    showMenu(
      values.map((value) => ({
        label: current.includes(value) ? `✓ ${value}` : value,
        onSelect: () => toggleSelection(value, current, setFn),
      })),
    );

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
              <TouchableOpacity
                onPress={() =>
                  showMenu([
                    {
                      label: "Muscle Group",
                      onSelect: () =>
                        showFilterOptions(
                          MUSCLE_GROUPS,
                          selectedMuscleGroups,
                          setSelectedMuscleGroups,
                        ),
                    },
                    {
                      label: "Category",
                      onSelect: () =>
                        showFilterOptions(
                          CATEGORIES,
                          selectedCategories,
                          setSelectedCategories,
                        ),
                    },
                    {
                      label: "Reset Filters",
                      onSelect: () => {
                        setSelectedMuscleGroups([]);
                        setSelectedCategories([]);
                      },
                      destructive: true,
                    },
                  ])
                }
              >
                <Ionicons
                  name="filter"
                  size={24}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>

              <Button title="New" onPress={() => setVisible(true)} />
            </View>
          ),
        }}
      />

      {topBar}

      <ExerciseSectionList
        sections={sections}
        renderItem={({ item }: { item: Exercise }) => (
          <ExerciseListItem
            exercise={item}
            selected={!!selectedItems?.some((i) => i.id === item.id)}
            onPress={() => onPress(item)}
          />
        )}
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
