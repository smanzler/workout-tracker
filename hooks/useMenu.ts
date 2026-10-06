import { useActionSheet } from "@expo/react-native-action-sheet";

export type MenuItem = {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

/**
 * Returns a function that shows the items in an action sheet with a Cancel
 * button, and calls `onSelect` of the item the user picks.
 */
export function useMenu() {
  const { showActionSheetWithOptions } = useActionSheet();

  return (items: MenuItem[]) =>
    showActionSheetWithOptions(
      {
        options: [...items.map((item) => item.label), "Cancel"],
        cancelButtonIndex: items.length,
        destructiveButtonIndex: items.flatMap((item, index) =>
          item.destructive ? [index] : []
        ),
        disabledButtonIndices: items.flatMap((item, index) =>
          item.disabled ? [index] : []
        ),
      },
      (index) => {
        if (index === undefined) return;
        items[index]?.onSelect();
      }
    );
}
