import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import { View } from "react-native";

type MonthTotals = Outputs["activity"]["workout"]["getMonthTotals"][number];

const formatCount = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "S"}`;

/** The month and, when they are loaded, its totals. */
export function MonthHeader({
  startedAt,
  totals,
}: {
  startedAt: Date;
  totals?: MonthTotals;
}) {
  return (
    <View className="flex-row items-baseline gap-2 border-b border-foreground bg-background px-5 pb-1.5 pt-3.5">
      <Text className="flex-1 font-mono text-[11px] font-semibold tracking-wider">
        {startedAt
          .toLocaleDateString("en-US", { month: "long", year: "numeric" })
          .toUpperCase()}
      </Text>
      {totals && (
        <Text className="font-mono text-[11px] tracking-wider text-muted-foreground">
          {formatCount(totals.workoutCount, "WORKOUT")} ·{" "}
          {formatCount(totals.recordCount, "PR")}
        </Text>
      )}
    </View>
  );
}
