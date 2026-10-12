import { useTheme } from "expo-router/react-navigation";

/** Props to spread on a `Stack.Toolbar.Button`, per look. */
export const useHeaderItems = () => {
  const { colors, fonts } = useTheme();

  return {
    plain: { style: fonts.regular },
    prominent: {
      variant: "prominent",
      tintColor: colors.primary,
      style: fonts.bold,
    },
  } as const;
};
