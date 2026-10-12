import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useId } from "react";
import { View, type TextInputProps } from "react-native";

/**
 * A mono label over an underlined input. `error` shows in place of `hint`.
 * `prefix` shows before the text, for example "@".
 */
export function LineField({
  label,
  hint,
  error,
  prefix,
  className,
  ...props
}: {
  label: string;
  hint?: string;
  error?: string | null;
  prefix?: string;
} & TextInputProps) {
  const labelId = useId();
  const footnote = error ?? hint;

  return (
    <View className="gap-1.5">
      <Text
        nativeID={labelId}
        className="font-mono text-[11px] font-semibold tracking-wider"
      >
        {label}
      </Text>
      <View className="h-12 flex-row items-center gap-0.5 border-b-[1.5px] border-foreground">
        {prefix && (
          <Text className="font-mono text-[17px] text-muted-foreground">
            {prefix}
          </Text>
        )}
        <Input
          accessibilityLabelledBy={labelId}
          className={cn(
            "h-12 flex-1 rounded-none border-0 bg-transparent px-0 text-[17px] shadow-none dark:bg-transparent",
            className,
          )}
          {...props}
        />
      </View>
      {footnote && (
        <Text
          className={cn(
            "font-mono text-[11px] uppercase text-muted-foreground",
            error && "text-destructive",
          )}
        >
          {footnote}
        </Text>
      )}
    </View>
  );
}
