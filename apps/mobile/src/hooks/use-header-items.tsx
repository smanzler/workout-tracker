import { Stack } from "expo-router";
import { useTheme } from "expo-router/react-navigation";

export type HeaderItem = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export type HeaderItemLook = "plain" | "prominent";

/**
 * Makes a text button for a `Stack.Toolbar`, per look. Put the result directly
 * in the toolbar, not in another component.
 */
export const useHeaderItems = (): Record<
  HeaderItemLook,
  (item: HeaderItem) => React.ReactElement
> => {
  const { colors, fonts } = useTheme();

  return {
    plain: ({ label, ...props }) => (
      <Stack.Toolbar.Button {...props} style={fonts.regular}>
        {label}
      </Stack.Toolbar.Button>
    ),
    prominent: ({ label, ...props }) => (
      <Stack.Toolbar.Button
        {...props}
        variant="prominent"
        tintColor={colors.primary}
        style={fonts.bold}
      >
        {label}
      </Stack.Toolbar.Button>
    ),
  };
};
