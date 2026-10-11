import { cn } from "@/lib/utils";
import { Pressable as NativePressable } from "react-native";

/** A Pressable that dims while it is pressed. */
function Pressable({
  className,
  ...props
}: React.ComponentProps<typeof NativePressable>) {
  return (
    <NativePressable
      className={cn("active:opacity-70", className)}
      {...props}
    />
  );
}

export { Pressable };
