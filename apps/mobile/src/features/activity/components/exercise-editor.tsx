import { Button } from "@/components/ui/button";
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
import { SetRow } from "./set-row";

/**
 * Edits one exercise of a draft. With `completable`, each set has a button
 * that marks it done, as in a workout; routines leave it out. The set with
 * `currentSetId` gets a highlight.
 */
export function ExerciseEditor({
  exercise,
  completable,
  currentSetId,
  onUpdate,
}: {
  exercise: DraftExercise;
  completable: boolean;
  currentSetId: string | undefined;
  onUpdate: (update: (draft: Draft) => Draft) => void;
}) {
  const { data: previousSets } = usePreviousSets(exercise.exercise.id);
  const showMenu = useMenu();
  const exerciseId = exercise.id;

  return (
    <View className="border-b border-border">
      <View className="flex-row items-center gap-2 pb-0.5 pl-5 pr-1 pt-2">
        <Text className="flex-1 text-[15px] font-bold" numberOfLines={1}>
          {exercise.exercise.title}
        </Text>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 rounded-full"
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
          <Icon as={Ellipsis} className="text-muted-foreground" />
        </Button>
      </View>

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
            current={set.id === currentSetId}
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
        variant="ghost"
        className="h-11 justify-start gap-1.5 rounded-none border-t border-border/60 px-5"
        onPress={() => onUpdate((draft) => addSet(draft, exerciseId))}
      >
        <Icon as={Plus} className="size-3.5 text-muted-foreground" />
        <Text className="font-mono text-[13px] font-normal">Add set</Text>
      </Button>
    </View>
  );
}
