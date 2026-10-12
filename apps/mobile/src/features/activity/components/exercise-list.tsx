import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useMenu } from "@/hooks/use-menu";
import { cn } from "@/lib/utils";
import type { MuscleGroup } from "@rep/shared";
import type { Outputs } from "@rep/api";
import { Stack } from "expo-router";
import { ChevronDown, SearchX } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "@/components/ui/pressable";
import { ScrollView, SectionList, View } from "react-native";
import { useExercises } from "../hooks/use-exercises";
import { buildExerciseSections, type ExerciseFilter } from "../lib/exercises";
import { keysOf } from "../lib/keys-of";
import { formatDate } from "@/lib/date";
import { formatSet } from "@/lib/format";
import { exerciseCategoryLabels, muscleGroupLabels } from "../lib/labels";
import { FilterChip } from "./filter-chip";
import { QueryView } from "@/components/query-view";

type Exercise = Outputs["activity"]["exercise"]["getAll"][number];

const describe = (
  { muscleGroup, bestSet, lastPerformedAt }: Exercise,
  isRecent: boolean,
) =>
  [
    (muscleGroup ? muscleGroupLabels[muscleGroup] : "Other").toUpperCase(),
    isRecent && lastPerformedAt
      ? formatDate(lastPerformedAt).toUpperCase()
      : bestSet && `BEST ${formatSet(bestSet)}`,
  ]
    .filter(Boolean)
    .join(" · ");

function ExerciseRow({
  exercise,
  isRecent,
  position,
  onPress,
}: {
  exercise: Exercise;
  isRecent: boolean;
  position?: number;
  onPress: () => void;
}) {
  const selected = position !== undefined;

  return (
    <Pressable
      onPress={onPress}
      accessibilityState={{ selected }}
      className={cn(
        "min-h-[58px] flex-row items-center gap-3 border-b border-border px-5 py-2",
        selected && "bg-brand/5",
      )}
    >
      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] font-medium">{exercise.title}</Text>
        <Text className="font-mono text-[11px] text-muted-foreground">
          {describe(exercise, isRecent)}
        </Text>
      </View>
      {selected && (
        <View className="size-6 items-center justify-center rounded-full bg-brand">
          <Text className="font-mono text-xs font-semibold text-brand-foreground">
            {position}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function Filters({
  filter,
  onChange,
}: {
  filter: ExerciseFilter;
  onChange: (filter: Partial<ExerciseFilter>) => void;
}) {
  const showMenu = useMenu();
  const setMuscleGroup = (muscleGroup: MuscleGroup | null) =>
    onChange({ muscleGroup });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-1.5 px-4 pb-3 pt-1"
    >
      <FilterChip
        selected={filter.muscleGroup === null}
        onPress={() => setMuscleGroup(null)}
      >
        ALL
      </FilterChip>
      {keysOf(muscleGroupLabels).map((muscleGroup) => (
        <FilterChip
          key={muscleGroup}
          selected={filter.muscleGroup === muscleGroup}
          onPress={() => setMuscleGroup(muscleGroup)}
        >
          {muscleGroupLabels[muscleGroup].toUpperCase()}
        </FilterChip>
      ))}
      <FilterChip
        selected={filter.category !== null}
        icon={ChevronDown}
        onPress={() =>
          showMenu([
            {
              label: "Any Category",
              onSelect: () => onChange({ category: null }),
            },
            ...keysOf(exerciseCategoryLabels).map((category) => ({
              label: exerciseCategoryLabels[category],
              onSelect: () => onChange({ category }),
            })),
          ])
        }
      >
        {(filter.category
          ? exerciseCategoryLabels[filter.category]
          : "Category"
        ).toUpperCase()}
      </FilterChip>
    </ScrollView>
  );
}

/**
 * All exercises, with the recent ones first, a search bar and filters for
 * muscle group and category. A row that `getPosition` gives a number to shows
 * that number.
 */
export function ExerciseList({
  onPress,
  getPosition = () => undefined,
}: {
  onPress: (exercise: Exercise) => void;
  getPosition?: (exercise: Exercise) => number | undefined;
}) {
  const exercisesQuery = useExercises();
  const [now] = useState(() => new Date());
  const [filter, setFilter] = useState<ExerciseFilter>({
    search: "",
    muscleGroup: null,
    category: null,
  });
  const updateFilter = (change: Partial<ExerciseFilter>) =>
    setFilter((current) => ({ ...current, ...change }));

  return (
    <>
      <Stack.SearchBar
        placeholder="Search exercises"
        // iOS 26 puts an automatic search bar in the bottom toolbar, over the picked exercises.
        placement="stacked"
        hideNavigationBar={false}
        hideWhenScrolling={false}
        onChangeText={(event) => {
          // The event is gone when React runs the updater.
          const search = event.nativeEvent.text;
          updateFilter({ search });
        }}
        onCancelButtonPress={() => updateFilter({ search: "" })}
      />

      <QueryView query={exercisesQuery} errorTitle="Couldn't load exercises">
        {(exercises) => (
          <SectionList
            sections={buildExerciseSections(exercises, filter, now)}
            keyExtractor={({ id }) => id}
            contentInsetAdjustmentBehavior="automatic"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            stickySectionHeadersEnabled
            ListHeaderComponent={
              <Filters filter={filter} onChange={updateFilter} />
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
              <View className="border-b border-foreground bg-background px-5 pb-1 pt-2.5">
                <Text className="font-mono text-[11px] font-semibold tracking-wider">
                  {section.title}
                </Text>
              </View>
            )}
            renderItem={({ item, section }) => (
              <ExerciseRow
                exercise={item}
                isRecent={section.isRecent}
                position={getPosition(item)}
                onPress={() => onPress(item)}
              />
            )}
          />
        )}
      </QueryView>
    </>
  );
}
