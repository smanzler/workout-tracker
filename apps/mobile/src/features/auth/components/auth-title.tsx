import { Text } from "@/components/ui/text";
import type { ReactNode } from "react";
import { View } from "react-native";

/** A blue mono label over a large title and a muted line. */
export function AuthTitle({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-mono text-[11px] font-semibold tracking-widest text-brand">
        {label}
      </Text>
      <Text role="heading" className="text-[30px] font-semibold tracking-tight">
        {title}
      </Text>
      <Text className="text-[15px] text-muted-foreground">{children}</Text>
    </View>
  );
}
