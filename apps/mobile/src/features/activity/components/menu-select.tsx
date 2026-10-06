import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useMenu } from "@/hooks/use-menu";
import { ChevronDown } from "lucide-react-native";
import { keysOf } from "../lib/keys-of";

/**
 * A button that shows the label of the chosen value and opens a menu of the
 * values in `labels`. `emptyLabel` stands for no value.
 */
export function MenuSelect<TValue extends string>({
  value,
  labels,
  emptyLabel,
  onChange,
}: {
  value: TValue | null;
  labels: Record<TValue, string>;
  emptyLabel: string;
  onChange: (value: TValue | null) => void;
}) {
  const showMenu = useMenu();
  const values = keysOf(labels);

  return (
    <Button
      variant="outline"
      size="sm"
      onPress={() =>
        showMenu([
          { label: emptyLabel, onSelect: () => onChange(null) },
          ...values.map((option) => ({
            label: labels[option],
            onSelect: () => onChange(option),
          })),
        ])
      }
    >
      <Text>{value === null ? emptyLabel : labels[value]}</Text>
      <Icon as={ChevronDown} className="size-4" />
    </Button>
  );
}
