import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useHeaderItems } from "@/hooks/use-header-items";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import type { DraftExerciseInfo } from "../lib/draft";
import { ExerciseList } from "./exercise-list";
import { PickedExercises } from "./picked-exercises";

const move = <TItem,>(items: TItem[], from: number, to: number) => {
  const next = [...items];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
};

/** A searchable list for choosing exercises, and the order to add them in. */
export function ExercisePicker({
  onAdd,
}: {
  onAdd: (exercises: DraftExerciseInfo[]) => void;
}) {
  const headerItems = useHeaderItems();
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
          headerShadowVisible: false,
        }}
      />
      <Stack.Toolbar placement="right">
        {headerItems.plain({
          label: "New",
          onPress: () => router.push("/new-exercise"),
        })}
      </Stack.Toolbar>
      <ExerciseList
        onPress={toggle}
        getPosition={(exercise) => {
          const index = selected.findIndex(({ id }) => id === exercise.id);
          return index === -1 ? undefined : index + 1;
        }}
      />
      {selected.length > 0 && (
        <View className="border-t-[1.5px] border-foreground bg-background pb-safe-offset-3">
          <PickedExercises
            exercises={selected}
            onMove={(from, to) =>
              setSelected((current) => move(current, from, to))
            }
            onRemove={(id) =>
              setSelected((current) =>
                current.filter((exercise) => exercise.id !== id),
              )
            }
          />
          <View className="px-4 pt-2">
            <Button variant="brand" size="xl" onPress={() => onAdd(selected)}>
              <Text>
                Add {selected.length}{" "}
                {selected.length === 1 ? "Exercise" : "Exercises"}
              </Text>
            </Button>
          </View>
        </View>
      )}
    </>
  );
}
