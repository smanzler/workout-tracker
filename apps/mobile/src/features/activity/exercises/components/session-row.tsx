import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { Outputs } from "@rep/api";
import { router } from "expo-router";
import { View } from "react-native";
import { toDayParts } from "@/lib/date";
import { formatSet } from "@/lib/format";
import { isPersonalRecord } from "@/lib/personal-records";

type Entry = Outputs["activity"]["exercise"]["history"]["entries"][number];

/** One session of an exercise on one line. A set that broke a record is blue. */
export function SessionRow({ entry }: { entry: Entry }) {
  const { day, month } = toDayParts(entry.startedAt);

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/workout-details",
          params: { workoutId: entry.workoutId },
        })
      }
      className="flex-row items-start gap-3.5 border-b border-border px-5 py-2.5"
    >
      <View className="w-11 pt-0.5">
        <Text className="font-mono text-[17px] font-medium">{day}</Text>
        <Text className="font-mono text-[11px] text-muted-foreground">
          {month}
        </Text>
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-[15px] font-medium" numberOfLines={1}>
          {entry.workoutName}
        </Text>
        <View className="flex-row flex-wrap gap-x-3">
          {entry.sets.map((set) => (
            <Text
              key={set.id}
              className={cn(
                "font-mono text-[13px]",
                isPersonalRecord(set) && "font-semibold text-brand",
              )}
            >
              {formatSet(set)}
            </Text>
          ))}
        </View>
      </View>
    </Pressable>
  );
}
