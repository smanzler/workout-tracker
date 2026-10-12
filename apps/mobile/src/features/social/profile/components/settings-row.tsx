import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";

/** A full-width settings row. `trailing` shows in place of the chevron. */
export function SettingsRow({
  label,
  value,
  chevron = false,
  destructive = false,
  trailing,
  onPress,
}: {
  label: string;
  value?: string;
  chevron?: boolean;
  destructive?: boolean;
  trailing?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="min-h-[50px] flex-row items-center gap-3 border-b border-border py-2 pl-5 pr-3.5"
    >
      <Text
        className={cn("flex-1 text-[15px]", destructive && "text-destructive")}
      >
        {label}
      </Text>
      {value !== undefined && (
        <Text
          className="font-mono text-[13px] text-muted-foreground"
          numberOfLines={1}
        >
          {value}
        </Text>
      )}
      {trailing ??
        (chevron && (
          <Icon as={ChevronRight} className="size-4 text-muted-foreground" />
        ))}
    </Pressable>
  );
}
