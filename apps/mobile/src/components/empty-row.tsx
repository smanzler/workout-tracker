import { Text } from "@/components/ui/text";
import type { ReactNode } from "react";
import { View } from "react-native";

/** A ledger row that tells why a list is empty. Put an action in `children`. */
export function EmptyRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <View className="items-start gap-1.5 border-b border-border px-5 py-4">
      <Text className="text-[15px] font-medium">{title}</Text>
      <Text className="text-sm leading-5 text-muted-foreground">
        {description}
      </Text>
      {children}
    </View>
  );
}
