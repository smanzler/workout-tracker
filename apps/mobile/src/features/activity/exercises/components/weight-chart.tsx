import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import { Circle, Line as SkiaLine, vec } from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { useAnimatedReaction } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useCSSVariable } from "uniwind";
import {
  CartesianChart,
  Line,
  Scatter,
  useChartPressState,
} from "victory-native";
import { toDayParts } from "@/lib/date";
import { formatSet } from "@/lib/format";
import { toChartPoints } from "../lib/chart";

type Entry = Outputs["activity"]["exercise"]["history"]["entries"][number];

const limit = 12;
const height = 150;
// Space in points between the plot and each edge, so that the dots fit.
const inset = 14;
// Width in points on the right for the value labels.
const gutter = 32;

const formatDay = (date: Date) => {
  const { weekday, day, month } = toDayParts(date);
  return `${weekday} ${day} ${month}`;
};

/**
 * The heaviest set of the last sessions. A press and drag on the chart
 * selects a session, and the readout above the chart opens its workout.
 */
export function WeightChart({ entries }: { entries: Entry[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [brand, border, background] = useCSSVariable([
    "--color-brand",
    "--color-border",
    "--color-background",
  ]).map((color) => String(color));
  const { state } = useChartPressState({ x: 0, y: { value: 0 } });

  const points = toChartPoints(entries, limit);
  const data = points.map(({ value }, index) => ({ index, value }));
  const min = Math.min(...points.map(({ value }) => value));
  const max = Math.max(...points.map(({ value }) => value));
  // A flat line needs a range, or the chart cannot place it.
  const domain: [number, number] =
    min === max ? [min - 1, max + 1] : [min, max];
  const index = Math.min(selected ?? points.length - 1, points.length - 1);
  const point = points[index];

  const select = (next: number) => {
    setSelected(next);
    Haptics.selectionAsync();
  };

  useAnimatedReaction(
    () => (state.isActive.get() ? state.matchedIndex.get() : -1),
    (next, previous) => {
      if (next >= 0 && next !== previous) scheduleOnRN(select, next);
    },
  );

  const first = points[0];
  const latest = points.at(-1);
  if (!point || !first || !latest) return null;

  const readout = `${formatSet(point.bestSet)}, ${formatDay(point.entry.startedAt)}`;

  return (
    <View className="gap-2 border-b border-border px-5 pb-2 pt-3">
      <View className="flex-row items-baseline">
        <Text className="flex-1 font-mono text-[11px] font-semibold tracking-wider">
          HEAVIEST SET
        </Text>
        <Text className="font-mono text-[11px] tracking-wider text-muted-foreground">
          LAST {points.length} {points.length === 1 ? "SESSION" : "SESSIONS"}
        </Text>
      </View>

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/workout-details",
            params: { workoutId: point.entry.workoutId },
          })
        }
        accessibilityHint="Opens the workout"
        className="flex-row items-center gap-3"
      >
        <Text className="font-mono text-lg font-medium text-brand">
          {formatSet(point.bestSet)}
        </Text>
        <Text
          className="flex-1 font-mono text-xs uppercase text-muted-foreground"
          numberOfLines={1}
        >
          {formatDay(point.entry.startedAt)} · {point.entry.workoutName}
        </Text>
        <Icon as={ChevronRight} className="size-4 text-muted-foreground" />
      </Pressable>

      <View
        style={{ height }}
        accessible
        accessibilityLabel="Heaviest set by session"
        accessibilityRole="adjustable"
        accessibilityValue={{ text: readout }}
        accessibilityActions={[
          { name: "increment", label: "Next session" },
          { name: "decrement", label: "Previous session" },
        ]}
        onAccessibilityAction={({ nativeEvent: { actionName } }) => {
          const next = index + (actionName === "increment" ? 1 : -1);
          if (next >= 0 && next < points.length) setSelected(next);
        }}
      >
        <Text
          className="absolute right-0 font-mono text-[10px] leading-[14px] text-muted-foreground"
          style={{ top: inset - 7 }}
        >
          {domain[1]}
        </Text>
        <Text
          className="absolute right-0 font-mono text-[10px] leading-[14px] text-muted-foreground"
          style={{ top: height - inset - 7 }}
        >
          {domain[0]}
        </Text>
        <CartesianChart
          data={data}
          xKey="index"
          yKeys={["value"]}
          domain={{ y: domain }}
          padding={{ right: gutter }}
          domainPadding={{
            left: inset,
            right: inset,
            top: inset,
            bottom: inset,
          }}
          chartPressState={state}
        >
          {({ points: chartPoints, chartBounds }) => {
            const active = chartPoints.value[index];
            const top = chartBounds.top + inset;
            const bottom = chartBounds.bottom - inset;

            return (
              <>
                <SkiaLine
                  p1={vec(chartBounds.left, top)}
                  p2={vec(chartBounds.right, top)}
                  color={border}
                  strokeWidth={1}
                />
                <SkiaLine
                  p1={vec(chartBounds.left, bottom)}
                  p2={vec(chartBounds.right, bottom)}
                  color={border}
                  strokeWidth={1}
                />
                {active?.y != null && (
                  <SkiaLine
                    p1={vec(active.x, chartBounds.top)}
                    p2={vec(active.x, chartBounds.bottom)}
                    color={brand}
                    opacity={0.35}
                    strokeWidth={1}
                  />
                )}
                <Line
                  points={chartPoints.value}
                  color={brand}
                  strokeWidth={2}
                  strokeJoin="round"
                />
                <Scatter
                  points={chartPoints.value}
                  radius={2.5}
                  color={brand}
                />
                {active?.y != null && (
                  <>
                    <Circle
                      cx={active.x}
                      cy={active.y}
                      r={7.5}
                      color={background}
                    />
                    <Circle cx={active.x} cy={active.y} r={5.5} color={brand} />
                  </>
                )}
              </>
            );
          }}
        </CartesianChart>
      </View>

      <View className="flex-row justify-between">
        <Text className="font-mono text-[10px] text-muted-foreground">
          {formatDay(first.entry.startedAt)}
        </Text>
        <Text className="font-mono text-[10px] text-muted-foreground">
          {formatDay(latest.entry.startedAt)}
        </Text>
      </View>
    </View>
  );
}
