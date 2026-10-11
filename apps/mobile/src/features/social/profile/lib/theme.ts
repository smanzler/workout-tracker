import { Storage } from "expo-sqlite/kv-store";
import { Uniwind } from "uniwind";

export const themeNames = ["light", "dark", "system"] as const;

export type ThemeName = (typeof themeNames)[number];

const storageKey = "theme";

const isThemeName = (value: string | null): value is ThemeName =>
  themeNames.some((name) => name === value);

/** Applies the theme and keeps it for the next launch. */
export const setTheme = (name: ThemeName) => {
  Uniwind.setTheme(name);
  Storage.setItemSync(storageKey, name);
};

/** Applies the saved theme. Call it before the first render. */
export const restoreTheme = () => {
  const saved = Storage.getItemSync(storageKey);
  if (isThemeName(saved)) Uniwind.setTheme(saved);
};
