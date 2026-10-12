import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { useCSSVariable } from "uniwind";
import { scheduleOnRN } from "react-native-worklets";
import { formatSet } from "@/lib/format";
import { toDayParts } from "@/lib/date";
import { findNearestIndex, layoutPoints, toChartPoints } from "../lib/chart";

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
 * The heaviest set of the last sessions. A drag or a tap on the chart selects
 * a session, and the readout above the chart opens its workout.
 */
export function WeightChart({ entries }: { entries: Entry[] }) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [brand, border, background] = useCSSVariable([
    "--color-brand",
    "--color-border",
    "--color-background",
  ]).map((color) => String(color));

  const points = toChartPoints(entries, limit);
  const values = points.map(({ value }) => value);
  const plotWidth = Math.max(0, width - gutter);
  const positions = layoutPoints(values, {
    width: plotWidth,
    height,
    inset,
  });
  const index = Math.min(selected ?? points.length - 1, points.length - 1);
  const point = points[index];
  const position = positions[index];
  const last = useSharedValue(index);
  // A worklet copies what it uses to the UI thread, and it cannot copy a Date.
  const count = points.length;

  const select = (next: number) => {
    setSelected(next);
    Haptics.selectionAsync();
  };

  const pick = (x: number) => {
    "worklet";
    const next = findNearestIndex(x, { count, width: plotWidth, inset });
    if (next === last.get()) return;
    last.set(next);
    scheduleOnRN(select, next);
  };

  const gesture = Gesture.Race(
    // Vertical drags stay with the scroll view.
    Gesture.Pan()
      .activeOffsetX([-6, 6])
      .failOffsetY([-12, 12])
      .onUpdate(({ x }) => pick(x)),
    Gesture.Tap().onEnd(({ x }) => pick(x)),
  );

  const first = points[0];
  const latest = points.at(-1);
  if (!point || !position || !first || !latest) return null;

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

      <GestureDetector gesture={gesture}>
        <View
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
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
            if (next >= 0 && next < points.length) {
              last.set(next);
              setSelected(next);
            }
          }}
        >
          <Text
            className="absolute right-0 font-mono text-[10px] leading-[14px] text-muted-foreground"
            style={{ top: inset - 7 }}
          >
            {Math.max(...values)}
          </Text>
          <Text
            className="absolute right-0 font-mono text-[10px] leading-[14px] text-muted-foreground"
            style={{ top: height - inset - 7 }}
          >
            {Math.min(...values)}
          </Text>
          {width > 0 && (
            <Svg width={width} height={height}>
              <Line
                x1={0}
                x2={plotWidth}
                y1={inset}
                y2={inset}
                stroke={border}
              />
              <Line
                x1={0}
                x2={plotWidth}
                y1={height - inset}
                y2={height - inset}
                stroke={border}
              />
              <Line
                x1={position.x}
                x2={position.x}
                y1={0}
                y2={height}
                stroke={brand}
                strokeOpacity={0.35}
              />
              <Polyline
                points={positions.map(({ x, y }) => `${x},${y}`).join(" ")}
                fill="none"
                stroke={brand}
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {positions.map(({ x, y }, pointIndex) => (
                <Circle
                  key={points[pointIndex]?.entry.id}
                  cx={x}
                  cy={y}
                  r={pointIndex === index ? 5.5 : 2.5}
                  fill={brand}
                  stroke={background}
                  strokeWidth={pointIndex === index ? 2 : 0}
                />
              ))}
            </Svg>
          )}
        </View>
      </GestureDetector>

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
