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

const rowClassName = "flex-row items-center gap-2 pl-5 pr-4";

const columnClassNames = {
  number: "w-7",
  previous: "flex-1",
  weight: "w-16",
  reps: "w-13",
  done: "w-11",
};

function ColumnLabel({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        "font-mono text-[11px] uppercase tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function SetHeader({ completable }: { completable: boolean }) {
  return (
    <View className={cn(rowClassName, "border-b border-border py-2")}>
      <ColumnLabel className={columnClassNames.number}>Set</ColumnLabel>
      <ColumnLabel className={columnClassNames.previous}>Prev</ColumnLabel>
      <ColumnLabel className={cn(columnClassNames.weight, "text-right")}>
        lb
      </ColumnLabel>
      <ColumnLabel className={cn(columnClassNames.reps, "text-right")}>
        Reps
      </ColumnLabel>
      {completable && (
        <ColumnLabel className={cn(columnClassNames.done, "text-center")}>
          Done
        </ColumnLabel>
      )}
    </View>
  );
}

function SetInput({
  completed,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { completed: boolean }) {
  return (
    <Input
      className={cn(
        "h-8 rounded-none border-0 border-b border-muted-foreground/40 bg-transparent px-0.5 text-right font-mono font-medium shadow-none dark:bg-transparent",
        completed && "border-transparent",
        className,
      )}
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
  current,
  previous,
  suggestion,
  completable,
  onChange,
  onToggle,
  onRemove,
}: {
  number: number;
  set: DraftSet;
  current: boolean;
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
      {/* The swipe action shows through a see-through row. */}
      <View className="bg-background">
        <View
          className={cn(
            rowClassName,
            "min-h-11 border-t border-border/60",
            current && "bg-brand/5",
          )}
        >
          <Text
            className={cn(
              columnClassNames.number,
              "font-mono text-[13px] text-muted-foreground",
            )}
          >
            {number}
          </Text>
          <Text
            className={cn(
              columnClassNames.previous,
              "font-mono text-[13px] text-muted-foreground",
            )}
            numberOfLines={1}
          >
            {previous ? formatSet(previous) : "—"}
          </Text>
          <SetInput
            completed={set.completed}
            className={columnClassNames.weight}
            value={set.weight}
            placeholder={suggestion.weight?.toString()}
            keyboardType="decimal-pad"
            accessibilityLabel={`Set ${number} weight`}
            onChangeText={(weight) => onChange({ weight })}
          />
          <SetInput
            completed={set.completed}
            className={columnClassNames.reps}
            value={set.reps}
            placeholder={suggestion.reps?.toString()}
            keyboardType="number-pad"
            accessibilityLabel={`Set ${number} reps`}
            onChangeText={(reps) => onChange({ reps })}
          />
          {completable && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(columnClassNames.done, "h-11 rounded-none")}
              disabled={!set.completed && !canCompleteSet(set, suggestion)}
              accessibilityLabel={
                set.completed
                  ? `Mark set ${number} not done`
                  : `Mark set ${number} done`
              }
              onPress={onToggle}
            >
              <View
                className={cn(
                  "size-[22px] items-center justify-center rounded border-[1.5px] border-muted-foreground",
                  set.completed && "border-brand bg-brand",
                )}
              >
                {set.completed && (
                  <Icon
                    as={Check}
                    strokeWidth={3.5}
                    className="size-3.5 text-brand-foreground"
                  />
                )}
              </View>
            </Button>
          )}
        </View>
      </View>
    </ReanimatedSwipeable>
  );
}
