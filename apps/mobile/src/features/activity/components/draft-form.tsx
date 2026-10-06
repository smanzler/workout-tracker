import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Plus } from "lucide-react-native";
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from "react-native-keyboard-controller";
import type { Draft } from "../lib/draft";
import { ExerciseEditor } from "./exercise-editor";

/**
 * The name and exercises of a workout or routine, and a button that calls
 * `onAddExercises`. Put more actions below the button as `children`.
 */
export function DraftForm({
  name,
  namePlaceholder,
  onChangeName,
  exercises,
  completable,
  onUpdate,
  onAddExercises,
  children,
}: {
  name: string;
  namePlaceholder: string;
  onChangeName: (name: string) => void;
  exercises: Draft;
  completable: boolean;
  onUpdate: (update: (draft: Draft) => Draft) => void;
  onAddExercises: () => void;
  children?: React.ReactNode;
}) {
  return (
    <>
      <KeyboardAwareScrollView
        bottomOffset={64}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-3 p-4 pb-safe-offset-4"
      >
        <Input
          value={name}
          onChangeText={onChangeName}
          placeholder={namePlaceholder}
          maxLength={100}
          accessibilityLabel={namePlaceholder}
          className="h-12 border-0 bg-transparent px-0 text-2xl font-semibold shadow-none dark:bg-transparent"
        />

        {exercises.map((exercise) => (
          <ExerciseEditor
            key={exercise.id}
            exercise={exercise}
            completable={completable}
            onUpdate={onUpdate}
          />
        ))}

        <Button onPress={onAddExercises}>
          <Icon as={Plus} className="size-4 text-primary-foreground" />
          <Text>Add Exercises</Text>
        </Button>
        {children}
      </KeyboardAwareScrollView>
      <KeyboardToolbar />
    </>
  );
}
