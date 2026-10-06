import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useMenu } from "@/hooks/use-menu";
import { Ellipsis, Plus } from "lucide-react-native";
import { View } from "react-native";
import { usePreviousSets } from "../hooks/use-previous-sets";
import {
  addSet,
  removeExercise,
  removeSet,
  toSetInput,
  toggleSet,
  updateSet,
  type Draft,
  type DraftExercise,
} from "../lib/draft";
import { SetHeader, SetRow } from "./set-row";

/**
 * Edits one exercise of a draft. With `completable`, each set has a button
 * that marks it done, as in a workout; routines leave it out.
 */
export function ExerciseEditor({
  exercise,
  completable,
  onUpdate,
}: {
  exercise: DraftExercise;
  completable: boolean;
  onUpdate: (update: (draft: Draft) => Draft) => void;
}) {
  const { data: previousSets } = usePreviousSets(exercise.exercise.id);
  const showMenu = useMenu();
  const exerciseId = exercise.id;

  return (
    <Card className="gap-2 py-3">
      <View className="flex-row items-center gap-2 pl-4 pr-2">
        <Text className="flex-1 text-lg font-semibold" numberOfLines={1}>
          {exercise.exercise.title}
        </Text>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          accessibilityLabel={`${exercise.exercise.title} options`}
          onPress={() =>
            showMenu([
              {
                label: "Remove Exercise",
                destructive: true,
                onSelect: () =>
                  onUpdate((draft) => removeExercise(draft, exerciseId)),
              },
            ])
          }
        >
          <Icon as={Ellipsis} />
        </Button>
      </View>

      <SetHeader completable={completable} />

      {exercise.sets.map((set, index) => {
        const lastWorkoutSet = previousSets?.[index];
        const setAbove = exercise.sets[index - 1];
        const above = setAbove ? toSetInput(setAbove) : undefined;
        const suggestion = {
          weight: lastWorkoutSet?.weight ?? above?.weight ?? null,
          reps: lastWorkoutSet?.reps ?? above?.reps ?? null,
        };

        return (
          <SetRow
            key={set.id}
            number={index + 1}
            set={set}
            previous={lastWorkoutSet}
            suggestion={suggestion}
            completable={completable}
            onChange={(values) =>
              onUpdate((draft) =>
                updateSet(draft, { exerciseId, setId: set.id, values }),
              )
            }
            onToggle={() =>
              onUpdate((draft) =>
                toggleSet(draft, { exerciseId, setId: set.id, suggestion }),
              )
            }
            onRemove={() =>
              onUpdate((draft) =>
                removeSet(draft, { exerciseId, setId: set.id }),
              )
            }
          />
        );
      })}

      <Button
        variant="secondary"
        size="sm"
        className="mx-4 mt-1"
        onPress={() => onUpdate((draft) => addSet(draft, exerciseId))}
      >
        <Icon as={Plus} className="size-4" />
        <Text>Add Set</Text>
      </Button>
    </Card>
  );
}
