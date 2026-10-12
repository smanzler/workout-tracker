import { Pressable } from "@/components/ui/pressable";
import { cn } from "@/lib/utils";

/**
 * One cell of a grid with two columns.
 * @param index Its position in the grid, to draw the line between the columns.
 */
export function Tile({
  index,
  className,
  ...props
}: React.ComponentProps<typeof Pressable> & { index: number }) {
  return (
    <Pressable
      className={cn(
        "min-h-[150px] w-1/2 justify-between gap-3 border-b border-border p-4",
        index % 2 === 0 && "border-r",
        className,
      )}
      {...props}
    />
  );
}
