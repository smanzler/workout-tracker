import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Stack } from "expo-router";
import { Check, SearchX } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "@/components/ui/pressable";
import { SectionList, View } from "react-native";
import { useExercises } from "../hooks/use-exercises";
import type { DraftExerciseInfo } from "../lib/draft";
import { filterExercises, groupByFirstLetter } from "../lib/exercises";
import { formatSet } from "../lib/format";
import { muscleGroupLabels } from "../lib/labels";
import { QueryView } from "./query-view";

/** A searchable list for choosing exercises to add to a workout or routine. */
export function ExercisePicker({
  actionLabel,
  onAdd,
}: {
  actionLabel: string;
  onAdd: (exercises: DraftExerciseInfo[]) => void;
}) {
  const exercisesQuery = useExercises();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DraftExerciseInfo[]>([]);

  const toggle = ({ id, title, category, muscleGroup }: DraftExerciseInfo) =>
    setSelected((current) =>
      current.some((exercise) => exercise.id === id)
        ? current.filter((exercise) => exercise.id !== id)
        : [...current, { id, title, category, muscleGroup }],
    );

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              variant="ghost"
              size="sm"
              disabled={selected.length === 0}
              onPress={() => onAdd(selected)}
            >
              <Text>
                {actionLabel} ({selected.length})
              </Text>
            </Button>
          ),
        }}
      />
      <Stack.SearchBar
        placeholder="Search exercises"
        hideNavigationBar={false}
        onChangeText={(event) => setSearch(event.nativeEvent.text)}
        onCancelButtonPress={() => setSearch("")}
      />

      <QueryView query={exercisesQuery} errorTitle="Couldn't load exercises">
        {(exercises) => (
          <SectionList
            sections={groupByFirstLetter(filterExercises(exercises, search))}
            keyExtractor={({ id }) => id}
            contentInsetAdjustmentBehavior="automatic"
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            stickySectionHeadersEnabled
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
            renderItem={({ item }) => {
              const isSelected = selected.some(({ id }) => id === item.id);

              return (
                <Pressable
                  onPress={() => toggle(item)}
                  className={cn(
                    "flex-row items-center gap-3 border-b border-border px-4 py-3",
                    isSelected && "bg-accent",
                  )}
                >
                  <View className="flex-1 gap-0.5">
                    <Text className="font-medium">{item.title}</Text>
                    <Text variant="muted">
                      {item.muscleGroup
                        ? muscleGroupLabels[item.muscleGroup]
                        : "Other"}
                      {item.bestSet ? ` · Best ${formatSet(item.bestSet)}` : ""}
                    </Text>
                  </View>
                  {isSelected && <Icon as={Check} className="text-primary" />}
                </Pressable>
              );
            }}
          />
        )}
      </QueryView>
    </>
  );
}
