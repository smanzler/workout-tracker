import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import { Trophy } from "lucide-react-native";
import { View } from "react-native";
import { formatSet, formatWeight } from "@/lib/format";
import { isPersonalRecord } from "@/lib/personal-records";
import { cn } from "@/lib/utils";
import { sumVolume } from "@/lib/volume";

type Item = Outputs["activity"]["workout"]["get"]["exercises"][number];

/** The notes and sets of one exercise. A set that broke a record gets a highlight. */
export function WorkoutExercise({
  exercise: { exercise, notes, sets },
}: {
  exercise: Item;
}) {
  return (
    <View className="gap-0.5 border-b border-border pb-2.5 pt-3">
      <View className="flex-row items-baseline gap-2 px-5 pb-1">
        <Text className="flex-1 text-[15px] font-bold" numberOfLines={1}>
          {exercise.title}
        </Text>
        <Text className="font-mono text-xs text-muted-foreground">
          {formatWeight(sumVolume(sets))}
        </Text>
      </View>
      {!!notes && (
        <Text className="mx-5 mb-1.5 border-l-2 border-border pl-2.5 text-[13px] text-muted-foreground">
          {notes}
        </Text>
      )}

      {sets.map((set, index) => {
        const record = isPersonalRecord(set);
        return (
          <View
            key={set.id}
            className={cn(
              "min-h-[26px] flex-row items-center gap-3 px-5",
              record && "bg-brand/10",
            )}
          >
            <Text className="w-4 font-mono text-sm text-muted-foreground">
              {index + 1}
            </Text>
            <Text
              className={cn(
                "flex-1 font-mono text-sm",
                record && "font-semibold text-brand",
              )}
            >
              {formatSet(set)}
            </Text>
            {record && (
              <View
                className="size-5 items-center justify-center rounded-full bg-brand"
                accessibilityLabel="Personal record"
              >
                <Icon as={Trophy} className="size-3 text-brand-foreground" />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
