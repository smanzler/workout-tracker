import { BodyScrollView } from "@/components/ui/body-scroll-view";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import type { ExerciseCategory, MuscleGroup } from "@rep/shared";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { MenuSelect } from "../../components/menu-select";
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

      <BodyScrollView keyboardShouldPersistTaps="handled">
        <FieldGroup>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setError(null);
              }}
              placeholder="Exercise name"
              maxLength={100}
              autoFocus
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <Field>
            <FieldLabel>Muscle Group</FieldLabel>
            <View className="flex-row">
              <MenuSelect
                value={muscleGroup}
                labels={muscleGroupLabels}
                emptyLabel="None"
                onChange={setMuscleGroup}
              />
            </View>
          </Field>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <View className="flex-row">
              <MenuSelect
                value={category}
                labels={exerciseCategoryLabels}
                emptyLabel="None"
                onChange={setCategory}
              />
            </View>
          </Field>
        </FieldGroup>
      </BodyScrollView>
    </>
  );
}
