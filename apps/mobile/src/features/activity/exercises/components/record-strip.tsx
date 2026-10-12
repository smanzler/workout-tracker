import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { PersonalRecord, PersonalRecordMetric } from "@rep/shared";
import { View } from "react-native";
import { toDayParts } from "@/lib/date";
import { formatWeight } from "@/lib/format";
import { keysOf } from "../../lib/keys-of";

const recordViews: Record<
  PersonalRecordMetric,
  { label: string; format: (value: number) => string }
> = {
  weight: { label: "MAX WEIGHT", format: (value) => `${value} lb` },
  oneRepMax: {
    label: "EST. 1RM",
    format: (value) => `${Math.round(value)} lb`,
  },
  volume: { label: "MAX VOLUME", format: formatWeight },
};

const metrics = keysOf(recordViews);

/** The best value of each record metric, and the day it was set. */
export function RecordStrip({
  records,
}: {
  records: Record<PersonalRecordMetric, PersonalRecord | null>;
}) {
  return (
    <View className="flex-row border-b border-border">
      {metrics.map((metric, index) => {
        const record = records[metric];
        const { label, format } = recordViews[metric];
        const { day, month } = record ? toDayParts(record.date) : {};

        return (
          <View
            key={metric}
            className={cn(
              "flex-1 gap-0.5 border-border py-3 pl-5 pr-2",
              index > 0 && "border-l",
            )}
          >
            <Text
              className="font-mono text-[11px] tracking-wide text-muted-foreground"
              numberOfLines={1}
            >
              {label}
            </Text>
            <Text className="font-mono text-lg font-medium" numberOfLines={1}>
              {record ? format(record.value) : "—"}
            </Text>
            {record && (
              <Text className="font-mono text-[11px] text-muted-foreground">
                {day} {month}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}
