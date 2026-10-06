import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { router, Stack } from "expo-router";
import { useState } from "react";
import type { DraftExerciseInfo } from "../lib/draft";
import { ExerciseList } from "./exercise-list";

/** A searchable list for choosing exercises to add to a workout or routine. */
export function ExercisePicker({
  actionLabel,
  onAdd,
}: {
  actionLabel: string;
  onAdd: (exercises: DraftExerciseInfo[]) => void;
}) {
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
          headerLeft: () => (
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.push("/(modals)/new-exercise")}
            >
              <Text>New</Text>
            </Button>
          ),
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
      <ExerciseList
        onPress={toggle}
        isSelected={(exercise) => selected.some(({ id }) => id === exercise.id)}
      />
    </>
  );
}
