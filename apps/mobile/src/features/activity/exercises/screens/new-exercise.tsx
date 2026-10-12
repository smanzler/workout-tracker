import { LineField } from "@/components/line-field";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { ExerciseCategory, MuscleGroup } from "@rep/shared";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { MenuSelect } from "../components/menu-select";
import { exerciseCategoryLabels, muscleGroupLabels } from "../../lib/labels";
import { useCreateExercise } from "../hooks/use-create-exercise";

export default function NewExercise() {
  const [title, setTitle] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const [category, setCategory] = useState<ExerciseCategory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { mutate: createExercise, isPending } = useCreateExercise();

  const save = () =>
    createExercise(
      { title: title.trim(), muscleGroup, category },
      {
        onSuccess: () => router.back(),
        onError: (caught) =>
          setError(
            caught.data?.code === "CONFLICT"
              ? "An exercise with this name already exists."
              : "Could not save the exercise. Try again.",
          ),
      },
    );

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Button variant="ghost" size="sm" onPress={() => router.back()}>
              <Text>Cancel</Text>
            </Button>
          ),
          headerRight: () => (
            <Button
              size="sm"
              disabled={title.trim() === "" || isPending}
              onPress={save}
            >
              <Text>Save</Text>
            </Button>
          ),
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 pb-6 pt-4">
          <LineField
            label="NAME"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setError(null);
            }}
            placeholder="Exercise name"
            maxLength={100}
            returnKeyType="done"
            autoFocus
            error={error}
          />
        </View>
        <Text className="border-b border-foreground px-5 pb-1.5 font-mono text-[11px] font-semibold tracking-wider">
          DETAILS
        </Text>
        <MenuSelect
          label="Muscle Group"
          value={muscleGroup}
          labels={muscleGroupLabels}
          emptyLabel="None"
          onChange={setMuscleGroup}
        />
        <MenuSelect
          label="Category"
          value={category}
          labels={exerciseCategoryLabels}
          emptyLabel="None"
          onChange={setCategory}
        />
      </ScrollView>
    </>
  );
}
