import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack } from "expo-router";
import { type ComponentProps, useEffect, useState } from "react";
import { type ImageSourcePropType, Platform } from "react-native";

type ToolbarIcon = NonNullable<
  ComponentProps<typeof Stack.Toolbar.Button>["icon"]
>;
type SFSymbol = Extract<ToolbarIcon, string>;
type MaterialIcon = ComponentProps<typeof MaterialIcons>["name"];

const sources = new Map<MaterialIcon, ImageSourcePropType>();

/**
 * The `icon` for a `Stack.Toolbar.Button`. Android gets `undefined` until the
 * Material icon is drawn, and the button does not show until then.
 */
export const useToolbarIcon = (
  sf: SFSymbol,
  md: MaterialIcon,
): ToolbarIcon | undefined => {
  const [source, setSource] = useState(() => sources.get(md));

  // Android toolbar buttons show only an image source, not an SF Symbol. The
  // toolbar tints the image, so the draw color has no effect.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    let current = true;
    MaterialIcons.getImageSource(md, 24, "black").then((image) => {
      if (!image) return;
      sources.set(md, image);
      if (current) setSource(image);
    });
    return () => {
      current = false;
    };
  }, [md]);

  return Platform.OS === "android" ? source : sf;
};
