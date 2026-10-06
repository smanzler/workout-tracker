import { BodyScrollView } from "@/components/ui/body-scroll-view";
import { Icon } from "@/components/ui/icon";
import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import {
  Check,
  Moon,
  SettingsIcon,
  Sun,
  type LucideIcon,
} from "lucide-react-native";
import { useUniwind } from "uniwind";
import {
  Section,
  SectionContent,
  SectionItem,
  SectionItemContent,
  SectionItemTitle,
} from "../components/section";
import { setTheme, themeNames, type ThemeName } from "../lib/theme";

const themeOptions: Record<ThemeName, { label: string; icon: LucideIcon }> = {
  light: { label: "Light", icon: Sun },
  dark: { label: "Dark", icon: Moon },
  system: { label: "System", icon: SettingsIcon },
};

export default function Theme() {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const activeTheme = hasAdaptiveThemes ? "system" : theme;

  const select = (name: ThemeName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTheme(name);
  };

  return (
    <BodyScrollView>
      <Stack.Screen options={{ title: "Theme" }} />
      <Section>
        <SectionContent>
          {themeNames.map((name) => (
            <SectionItem key={name} onPress={() => select(name)}>
              <Icon as={themeOptions[name].icon} />
              <SectionItemTitle>{themeOptions[name].label}</SectionItemTitle>
              {activeTheme === name && (
                <SectionItemContent>
                  <Icon as={Check} />
                </SectionItemContent>
              )}
            </SectionItem>
          ))}
        </SectionContent>
      </Section>
    </BodyScrollView>
  );
}
