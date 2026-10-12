import { LineField } from "@/components/line-field";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";
import { ListRow } from "@/components/list-row";
import { keysOf } from "../../lib/keys-of";
import {
  describeOption,
  exerciseOptions,
  type ExerciseOption,
  type ExerciseOptions,
} from "../lib/exercise-options";
import { OptionSheet } from "../../components/option-sheet";
import { useCreateExercise } from "../hooks/use-create-exercise";

export default function NewExercise() {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<ExerciseOptions>({
    muscleGroup: null,
    category: null,
  });
  const [openOption, setOpenOption] = useState<ExerciseOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { mutate: createExercise, isPending } = useCreateExercise();

  const save = () =>
    createExercise(
      { title: title.trim(), ...options },
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
        {keysOf(exerciseOptions).map((option) => {
          const { title, labels, value } = describeOption(option, options);
          return (
            <ListRow
              key={option}
              label={title}
              value={(value === null ? "None" : labels[value]).toUpperCase()}
              onPress={() => {
                Keyboard.dismiss();
                setOpenOption(option);
              }}
            />
          );
        })}
      </ScrollView>
      {openOption && (
        <OptionSheet
          {...describeOption(openOption, options)}
          onChange={(value) =>
            setOptions((current) => ({ ...current, [openOption]: value }))
          }
          onClose={() => setOpenOption(null)}
        />
      )}
    </>
  );
}
