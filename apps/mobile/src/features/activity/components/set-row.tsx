import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { WorkoutSetInput } from "@rep/shared";
import { Check, Trash2 } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { formatSet } from "@/lib/format";
import { canCompleteSet, type DraftSet } from "../lib/draft";

export function SetHeader({ completable }: { completable: boolean }) {
  return (
    <View className="flex-row items-center gap-2 px-4">
      <Text variant="small" className="w-7 text-center text-muted-foreground">
        Set
      </Text>
      <Text variant="small" className="flex-1 text-muted-foreground">
        Previous
      </Text>
      <Text variant="small" className="w-16 text-center text-muted-foreground">
        lb
      </Text>
      <Text variant="small" className="w-16 text-center text-muted-foreground">
        Reps
      </Text>
      {completable && (
        <View className="w-9 items-center">
          <Icon as={Check} className="size-4 text-muted-foreground" />
        </View>
      )}
    </View>
  );
}

function SetInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn("h-9 w-16 px-1 text-center", className)}
      selectTextOnFocus
      {...props}
    />
  );
}

/**
 * One set in the exercise editor. `suggestion` fills the placeholders and the
 * empty fields when the set is marked done. Swipe left to remove it.
 */
export function SetRow({
  number,
  set,
  previous,
  suggestion,
  completable,
  onChange,
  onToggle,
  onRemove,
}: {
  number: number;
  set: DraftSet;
  previous: WorkoutSetInput | undefined;
  suggestion: WorkoutSetInput;
  completable: boolean;
  onChange: (values: Partial<Pick<DraftSet, "weight" | "reps">>) => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      renderRightActions={() => (
        <Pressable
          onPress={onRemove}
          accessibilityLabel={`Remove set ${number}`}
          className="w-20 items-center justify-center bg-destructive"
        >
          <Icon as={Trash2} className="text-white" />
        </Pressable>
      )}
    >
      <View
        className={cn(
          "flex-row items-center gap-2 bg-card px-4 py-1",
          set.completed && "bg-green-500/15",
        )}
      >
        <Text className="w-7 text-center font-semibold text-muted-foreground">
          {number}
        </Text>
        <Text variant="muted" className="flex-1" numberOfLines={1}>
          {previous ? formatSet(previous) : "—"}
        </Text>
        <SetInput
          value={set.weight}
          placeholder={suggestion.weight?.toString()}
          keyboardType="decimal-pad"
          accessibilityLabel={`Set ${number} weight`}
          onChangeText={(weight) => onChange({ weight })}
        />
        <SetInput
          value={set.reps}
          placeholder={suggestion.reps?.toString()}
          keyboardType="number-pad"
          accessibilityLabel={`Set ${number} reps`}
          onChangeText={(reps) => onChange({ reps })}
        />
        {completable && (
          <Button
            size="icon"
            variant={set.completed ? "default" : "secondary"}
            className={cn("size-9", set.completed && "bg-green-600")}
            disabled={!set.completed && !canCompleteSet(set, suggestion)}
            accessibilityLabel={
              set.completed
                ? `Mark set ${number} not done`
                : `Mark set ${number} done`
            }
            onPress={onToggle}
          >
            <Icon
              as={Check}
              className={cn("size-4", set.completed && "text-white")}
            />
          </Button>
        )}
      </View>
    </ReanimatedSwipeable>
  );
}
