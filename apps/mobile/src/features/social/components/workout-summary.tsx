import { RecordBadge } from "@/components/record-badge";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { Outputs } from "@rep/api";
import { View } from "react-native";
import { formatTime, toDayParts } from "@/lib/date";
import { findBestSet, formatSet, formatWeight } from "@/lib/format";
import { formatDuration, getWorkoutLength } from "@/lib/duration";
import { countPersonalRecords, isPersonalRecord } from "@/lib/personal-records";
import { sumVolume } from "@/lib/volume";

type Workout = Outputs["activity"]["workout"]["get"];

/** The day, stats, records and best set of each exercise of a workout. */
export function WorkoutSummary({ workout }: { workout: Workout }) {
  const sets = workout.exercises.flatMap(({ sets }) => sets);
  const records = countPersonalRecords(sets);
  const { weekday, day, month } = toDayParts(workout.startedAt);

  return (
    <View className="flex-row">
      <View className="w-[68px] items-center border-r border-border py-4">
        <Text className="font-mono text-[11px] tracking-wider text-muted-foreground">
          {weekday}
        </Text>
        <Text className="font-mono text-[28px] font-medium leading-tight">
          {day}
        </Text>
        <Text className="font-mono text-[11px] tracking-wider text-muted-foreground">
          {month}
        </Text>
      </View>

      <View className="flex-1 gap-2 py-3.5 pl-3.5 pr-4">
        <View className="flex-row items-center gap-2">
          <Text className="flex-1 text-[17px] font-semibold" numberOfLines={1}>
            {workout.name}
          </Text>
          {records > 0 && <RecordBadge count={records} />}
        </View>
        <Text className="font-mono text-xs text-muted-foreground">
          {[
            formatTime(workout.startedAt),
            formatDuration(getWorkoutLength(workout)),
            formatWeight(sumVolume(sets)),
          ].join(" · ")}
        </Text>
        <View className="gap-1">
          {workout.exercises.map(({ id, exercise, sets }) => {
            const bestSet = findBestSet(sets);

            return (
              <View key={id} className="flex-row items-baseline gap-2">
                <Text className="flex-1 text-sm" numberOfLines={1}>
                  {sets.length} × {exercise.title}
                </Text>
                {bestSet && (
                  <Text
                    className={cn(
                      "font-mono text-[13px]",
                      sets.some(isPersonalRecord) && "font-semibold text-brand",
                    )}
                  >
                    {formatSet(bestSet)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
