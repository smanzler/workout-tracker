import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import { Trophy } from "lucide-react-native";
import { View } from "react-native";
import { formatSet, formatWeight } from "@/lib/format";
import { isPersonalRecord } from "@/lib/personal-records";
import { sumVolume } from "@/lib/volume";

type WorkoutExercise =
  Outputs["activity"]["workout"]["get"]["exercises"][number];

/** The sets of one exercise. A set that broke a record gets a highlight. */
export function SummaryExercise({
  exercise: { exercise, sets },
}: {
  exercise: WorkoutExercise;
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

      {sets.map((set, index) =>
        isPersonalRecord(set) ? (
          <View
            key={set.id}
            className="mx-3 flex-row items-center gap-3 rounded-md bg-brand/10 px-2 py-2"
          >
            <Text className="w-4 font-mono text-sm text-muted-foreground">
              {index + 1}
            </Text>
            <Text className="flex-1 font-mono text-[15px] font-semibold text-brand">
              {formatSet(set)}
            </Text>
            <View
              className="size-7 items-center justify-center rounded-full bg-brand"
              accessibilityLabel="Personal record"
            >
              <Icon as={Trophy} className="size-4 text-brand-foreground" />
            </View>
          </View>
        ) : (
          <View
            key={set.id}
            className="min-h-[26px] flex-row items-center gap-3 px-5"
          >
            <Text className="w-4 font-mono text-sm text-muted-foreground">
              {index + 1}
            </Text>
            <Text className="flex-1 font-mono text-sm">{formatSet(set)}</Text>
          </View>
        ),
      )}
    </View>
  );
}
