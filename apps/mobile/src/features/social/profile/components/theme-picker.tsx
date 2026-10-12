import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as Haptics from "expo-haptics";
import { View } from "react-native";
import { useUniwind } from "uniwind";
import { setTheme, type ThemeName } from "../lib/theme";

const themeOrder: ThemeName[] = ["system", "light", "dark"];

/** A segmented control that applies and keeps the theme. */
export function ThemePicker() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const activeTheme = hasAdaptiveThemes ? "system" : theme;

  const select = (name: ThemeName) => {
    Haptics.selectionAsync();
    setTheme(name);
  };

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Theme"
      className="flex-row border-b border-border"
    >
      {themeOrder.map((name, index) => {
        const selected = name === activeTheme;

        return (
          <Pressable
            key={name}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => select(name)}
            className={cn(
              "h-[50px] flex-1 items-center justify-center border-border",
              index > 0 && "border-l",
              selected && "bg-foreground",
            )}
          >
            <Text
              className={cn(
                "font-mono text-xs font-semibold uppercase tracking-wider",
                selected && "text-background",
              )}
            >
              {name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
