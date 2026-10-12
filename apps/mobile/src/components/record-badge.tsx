import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Trophy } from "lucide-react-native";
import { View } from "react-native";

/** The number of records that a workout broke. */
export function RecordBadge({ count }: { count: number }) {
  return (
    <View
      className="h-5 flex-row items-center gap-1 rounded-full bg-brand px-2"
      accessibilityLabel={`${count} ${count === 1 ? "record" : "records"}`}
    >
      <Icon as={Trophy} className="size-2.5 text-brand-foreground" />
      <Text className="font-mono text-[11px] font-semibold text-brand-foreground">
        {count}
      </Text>
    </View>
  );
}
