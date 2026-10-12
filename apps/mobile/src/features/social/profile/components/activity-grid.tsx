import { Text } from "@/components/ui/text";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { View } from "react-native";
import { useWorkoutDays } from "../hooks/use-workout-days";
import { countWeekStreak, listWeeks, toDayKey } from "../lib/activity";

const weekCount = 16;

const dayClassName = ({
  day,
  now,
  days,
}: {
  day: Date;
  now: Date;
  days: Set<string>;
}) => {
  if (day > now) return "bg-transparent";
  return days.has(toDayKey(day)) ? "bg-brand" : "bg-muted";
};

const monthOf = (week?: Date[]) => week?.[0].getMonth();

/** Names a month at its first week. The first column gets a name only when the next week has the same month, so that two names do not touch. */
const monthLabel = (weeks: Date[][], index: number) => {
  const week = weeks[index];
  const isNewMonth =
    index === 0
      ? monthOf(weeks[1]) === monthOf(week)
      : monthOf(weeks[index - 1]) !== monthOf(week);

  return isNewMonth
    ? week[0].toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    : undefined;
};

/** One square for each day of the last 16 weeks, filled on workout days. */
export function ActivityGrid({ userId }: { userId: string }) {
  const [now] = useState(() => new Date());
  const weeks = listWeeks(now, weekCount);
  const { data = [] } = useWorkoutDays({ userId, from: weeks[0][0] });
  const days = new Set(data);

  return (
    <View className="gap-2 border-b border-border px-5 pb-3.5 pt-3">
      <View className="flex-row items-baseline gap-2">
        <Text className="flex-1 font-mono text-[11px] font-semibold tracking-wider">
          LAST {weekCount} WEEKS
        </Text>
        <Text className="font-mono text-[11px] tracking-wider text-muted-foreground">
          {formatCount(data.length, "WORKOUT")} · {countWeekStreak(weeks, days)}{" "}
          WK STREAK
        </Text>
      </View>

      <View
        className="flex-row gap-[3px]"
        accessible
        accessibilityLabel={`${data.length} workouts in the last ${weekCount} weeks`}
      >
        {weeks.map((week) => (
          <View key={toDayKey(week[0])} className="flex-1 gap-[3px]">
            {week.map((day) => (
              <View
                key={toDayKey(day)}
                className={cn(
                  "aspect-square rounded-[2px]",
                  dayClassName({ day, now, days }),
                )}
              />
            ))}
          </View>
        ))}
      </View>

      <View
        className="h-3 flex-row gap-[3px]"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {weeks.map((week, index) => (
          <View key={toDayKey(week[0])} className="flex-1">
            <Text className="absolute left-0 w-10 font-mono text-[10px] text-muted-foreground">
              {monthLabel(weeks, index)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
