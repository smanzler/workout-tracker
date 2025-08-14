import type { StyleProp, ViewStyle } from "react-native";

export type OnLoadEventPayload = {
  url: string;
};

export type NativeChartsModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

type Point = {
  x: number;
  y: number;
};

export type NativeChartsViewProps = {
  data: Point[];
  style?: StyleProp<ViewStyle>;
};
