import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react-native";

/** A round toggle for one filter value. */
export function FilterChip({
  selected,
  icon,
  children,
  ...props
}: React.ComponentProps<typeof Pressable> & {
  selected: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        "h-[30px] flex-row items-center gap-1 rounded-full border px-3",
        selected ? "border-foreground bg-foreground" : "border-border",
      )}
      {...props}
    >
      <Text
        className={cn(
          "font-mono text-[11px] font-medium tracking-wide",
          selected && "text-background",
        )}
      >
        {children}
      </Text>
      {icon && (
        <Icon
          as={icon}
          className={cn("size-3", selected && "text-background")}
        />
      )}
    </Pressable>
  );
}
