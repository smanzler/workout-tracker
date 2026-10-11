import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import { findCurrentSet, type Draft } from "../lib/draft";
import { ExerciseEditor } from "./exercise-editor";
import { SetHeader } from "./set-row";

/**
 * The name and exercises of a workout or routine, and a button that calls
 * `onAddExercises`. `summary` shows below the name. Put more actions beside
 * the button as `children`.
 */
export function DraftForm({
  name,
  namePlaceholder,
  onChangeName,
  summary,
  exercises,
  completable,
  onUpdate,
  onAddExercises,
  children,
}: {
  name: string;
  namePlaceholder: string;
  onChangeName: (name: string) => void;
  summary?: React.ReactNode;
  exercises: Draft;
  completable: boolean;
  onUpdate: (update: (draft: Draft) => Draft) => void;
  onAddExercises: () => void;
  children?: React.ReactNode;
}) {
  const currentSetId = completable ? findCurrentSet(exercises)?.id : undefined;

  return (
    <>
      <KeyboardAwareScrollView
        bottomOffset={64}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-safe-offset-4"
      >
        <View className="gap-1.5 border-b border-border px-5 pb-3.5 pt-2">
          <Input
            value={name}
            onChangeText={onChangeName}
            placeholder={namePlaceholder}
            maxLength={100}
            accessibilityLabel={namePlaceholder}
            className="h-11 border-0 bg-transparent px-0 text-[26px] font-semibold shadow-none dark:bg-transparent"
          />
          {summary}
        </View>

        {exercises.length > 0 && <SetHeader completable={completable} />}

        {exercises.map((exercise) => (
          <ExerciseEditor
            key={exercise.id}
            exercise={exercise}
            completable={completable}
            currentSetId={currentSetId}
            onUpdate={onUpdate}
          />
        ))}

        <View className="flex-row gap-2 p-4">
          <Button
            variant="strong"
            size="xl"
            className="flex-1"
            onPress={onAddExercises}
          >
            <Text>Add Exercises</Text>
          </Button>
          {children}
        </View>
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
}
