import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import type { PersonalRecord, PersonalRecordMetric } from "@rep/shared";
import { View } from "react-native";
import { formatDate } from "@/lib/date";
import { formatWeight } from "@/lib/format";
import { keysOf } from "../../lib/keys-of";

const recordViews: Record<
  PersonalRecordMetric,
  { label: string; format: (value: number) => string }
> = {
  weight: { label: "Max Weight", format: (value) => `${value} lb` },
  oneRepMax: {
    label: "Est. 1RM",
    format: (value) => `${Math.round(value)} lb`,
  },
  volume: { label: "Max Volume", format: formatWeight },
};

const metrics = keysOf(recordViews);

export function PersonalRecordCards({
  records,
}: {
  records: Record<PersonalRecordMetric, PersonalRecord | null>;
}) {
  return (
    <View className="flex-row gap-2">
      {metrics.map((metric) => {
        const record = records[metric];
        const { label, format } = recordViews[metric];

        return (
          <Card key={metric} className="flex-1 gap-1 px-3 py-3">
            <Text variant="muted" numberOfLines={1}>
              {label}
            </Text>
            <Text
              className="text-lg font-semibold"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {record ? format(record.value) : "—"}
            </Text>
            {record && (
              <Text variant="muted" numberOfLines={1}>
                {formatDate(record.date)}
              </Text>
            )}
          </Card>
        );
      })}
    </View>
  );
}
