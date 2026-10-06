import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { Outputs } from "@rep/api";
import { Stack } from "expo-router";
import { Check, SearchX } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "@/components/ui/pressable";
import { SectionList, View } from "react-native";
import { useExercises } from "../hooks/use-exercises";
import {
  filterExercises,
  groupByFirstLetter,
  type ExerciseFilter,
} from "../lib/exercises";
import { formatSet } from "@/lib/format";
import { exerciseCategoryLabels, muscleGroupLabels } from "../lib/labels";
import { MenuSelect } from "./menu-select";
import { QueryView } from "@/components/query-view";

type Exercise = Outputs["activity"]["exercise"]["getAll"][number];

const describe = ({ muscleGroup, bestSet }: Exercise) =>
  [
    muscleGroup ? muscleGroupLabels[muscleGroup] : "Other",
    bestSet && `Best ${formatSet(bestSet)}`,
  ]
    .filter(Boolean)
    .join(" · ");

function ExerciseRow({
  exercise,
  selected,
  onPress,
}: {
  exercise: Exercise;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-3 border-b border-border px-4 py-3",
        selected && "bg-accent",
      )}
    >
      <View className="flex-1 gap-0.5">
        <Text className="font-medium">{exercise.title}</Text>
        <Text variant="muted">{describe(exercise)}</Text>
      </View>
      {selected && <Icon as={Check} className="text-primary" />}
    </Pressable>
  );
}

/**
 * All exercises in letter sections, with a search bar and filters for muscle
 * group and category. Rows that `isSelected` accepts show a check mark.
 */
export function ExerciseList({
  onPress,
  isSelected = () => false,
}: {
  onPress: (exercise: Exercise) => void;
  isSelected?: (exercise: Exercise) => boolean;
}) {
  const exercisesQuery = useExercises();
  const [filter, setFilter] = useState<ExerciseFilter>({
    search: "",
    muscleGroup: null,
    category: null,
  });

  return (
    <>
      <Stack.SearchBar
        placeholder="Search exercises"
        hideNavigationBar={false}
        onChangeText={(event) => {
          // The event is gone when React runs the updater.
          const search = event.nativeEvent.text;
          setFilter((current) => ({ ...current, search }));
        }}
        onCancelButtonPress={() =>
          setFilter((current) => ({ ...current, search: "" }))
        }
      />

      <QueryView query={exercisesQuery} errorTitle="Couldn't load exercises">
        {(exercises) => (
          <SectionList
            sections={groupByFirstLetter(filterExercises(exercises, filter))}
            keyExtractor={({ id }) => id}
            contentInsetAdjustmentBehavior="automatic"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            stickySectionHeadersEnabled
            ListHeaderComponent={
              <View className="flex-row flex-wrap gap-2 px-4 pt-2 pb-1">
                <MenuSelect
                  value={filter.muscleGroup}
                  labels={muscleGroupLabels}
                  emptyLabel="Any Muscle Group"
                  onChange={(muscleGroup) =>
                    setFilter((current) => ({ ...current, muscleGroup }))
                  }
                />
                <MenuSelect
                  value={filter.category}
                  labels={exerciseCategoryLabels}
                  emptyLabel="Any Category"
                  onChange={(category) =>
                    setFilter((current) => ({ ...current, category }))
                  }
                />
              </View>
            }
            ListEmptyComponent={
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Icon as={SearchX} />
                  </EmptyMedia>
                  <EmptyTitle>No exercises found</EmptyTitle>
                </EmptyHeader>
              </Empty>
            }
            renderSectionHeader={({ section }) => (
              <View className="bg-background px-4 pt-3 pb-1">
                <Text className="text-lg font-bold">{section.title}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <ExerciseRow
                exercise={item}
                selected={isSelected(item)}
                onPress={() => onPress(item)}
              />
            )}
          />
        )}
      </QueryView>
    </>
  );
}
