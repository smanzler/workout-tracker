import { ListRow } from "@/components/list-row";
import { Icon } from "@/components/ui/icon";
import { useMenu } from "@/hooks/use-menu";
import { ChevronsUpDown } from "lucide-react-native";
import { keysOf } from "../../lib/keys-of";

/**
 * A row that shows the label of the chosen value and opens a menu of the
 * values in `labels`. `emptyLabel` stands for no value.
 */
export function MenuSelect<TValue extends string>({
  label,
  value,
  labels,
  emptyLabel,
  onChange,
}: {
  label: string;
  value: TValue | null;
  labels: Record<TValue, string>;
  emptyLabel: string;
  onChange: (value: TValue | null) => void;
}) {
  const showMenu = useMenu();
  const values = keysOf(labels);

  return (
    <ListRow
      label={label}
      value={(value === null ? emptyLabel : labels[value]).toUpperCase()}
      trailing={
        <Icon as={ChevronsUpDown} className="size-4 text-muted-foreground" />
      }
      onPress={() =>
        showMenu([
          { label: emptyLabel, onSelect: () => onChange(null) },
          ...values.map((option) => ({
            label: labels[option],
            onSelect: () => onChange(option),
          })),
        ])
      }
    />
  );
}
