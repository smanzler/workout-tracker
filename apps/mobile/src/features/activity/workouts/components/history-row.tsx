import { RecordBadge } from "@/components/record-badge";
import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import { View } from "react-native";
import { toDayParts } from "@/lib/date";
import { formatDuration, getWorkoutLength } from "@/lib/duration";
import { formatWeight } from "@/lib/format";
import { countPersonalRecords } from "@/lib/personal-records";
import { sumVolume } from "@/lib/volume";

type Workout = Outputs["activity"]["workout"]["get"];

/** One line of the history: the day, the name, the exercises and the volume. */
export function HistoryRow({ workout }: { workout: Workout }) {
  const sets = workout.exercises.flatMap(({ sets }) => sets);
  const records = countPersonalRecords(sets);
  const { weekday, day } = toDayParts(workout.startedAt);

  return (
    <View className="min-h-16 flex-row items-center gap-3 border-b border-border px-5 py-2.5">
      <View className="w-[34px] items-center">
        <Text className="font-mono text-lg font-medium leading-tight">
          {day}
        </Text>
        <Text className="font-mono text-[10px] tracking-wider text-muted-foreground">
          {weekday}
        </Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold" numberOfLines={1}>
          {workout.name}
        </Text>
        <Text className="text-[13px] text-muted-foreground" numberOfLines={1}>
          {workout.exercises.map(({ exercise }) => exercise.title).join(", ")}
        </Text>
      </View>
      <View className="items-end gap-1">
        <Text className="font-mono text-[13px]">
          {formatWeight(sumVolume(sets))}
        </Text>
        {records > 0 ? (
          <RecordBadge count={records} />
        ) : (
          <Text className="font-mono text-xs text-muted-foreground">
            {formatDuration(getWorkoutLength(workout))}
          </Text>
        )}
      </View>
    </View>
  );
}
