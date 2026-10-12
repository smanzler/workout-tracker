import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import * as Haptics from "expo-haptics";
import { GripVertical, X } from "lucide-react-native";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { DraftExerciseInfo } from "../lib/draft";
import { moveRow, type Positions } from "../lib/positions";

// Every row has this height in points, so that a drag distance gives a position.
const rowHeight = 44;
const visibleRows = 4;
const timing = { duration: 160 };

const toPositions = (exercises: DraftExerciseInfo[]) =>
  Object.fromEntries(exercises.map(({ id }, index) => [id, index]));

const tick = () => Haptics.selectionAsync();
const lift = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

function PickedRow({
  exercise,
  index,
  count,
  positions,
  activeId,
  onMove,
  onRemove,
}: {
  exercise: DraftExerciseInfo;
  index: number;
  count: number;
  positions: SharedValue<Positions>;
  activeId: SharedValue<string | null>;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  const { id, title } = exercise;
  const top = useSharedValue(index * rowHeight);
  const lifted = useSharedValue(0);
  const start = useSharedValue(index);

  // Slide to a new position, except while the finger holds the row.
  useAnimatedReaction(
    () => positions.get()[id],
    (position, previous) => {
      if (position === undefined || position === previous) return;
      if (activeId.get() !== id)
        top.set(withTiming(position * rowHeight, timing));
    },
  );

  const drag = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      activeId.set(id);
      start.set(positions.get()[id]);
      lifted.set(withTiming(1, timing));
      scheduleOnRN(lift);
    })
    .onChange(({ changeY }) => {
      const nextTop = Math.min(
        (count - 1) * rowHeight,
        Math.max(0, top.get() + changeY),
      );
      top.set(nextTop);

      const from = positions.get()[id];
      const to = Math.round(nextTop / rowHeight);
      if (to === from) return;

      positions.set(moveRow(positions.get(), id, from, to));
      scheduleOnRN(tick);
    })
    .onFinalize(() => {
      const end = positions.get()[id];
      top.set(withTiming(end * rowHeight, timing));
      lifted.set(withTiming(0, timing));
      activeId.set(null);
      // Change the order only once, so that a render cannot undo a later move.
      if (end !== start.get()) scheduleOnRN(onMove, start.get(), end);
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: top.get() }, { scale: 1 + lifted.get() * 0.02 }],
    zIndex: activeId.get() === id ? 1 : 0,
    shadowOpacity: lifted.get() * 0.18,
    elevation: lifted.get() * 6,
  }));
  const tintStyle = useAnimatedStyle(() => ({ opacity: lifted.get() }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          height: rowHeight,
          shadowColor: "#000",
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        },
        rowStyle,
      ]}
      className="flex-row items-center gap-3 bg-background pl-5 pr-2"
    >
      <Animated.View
        pointerEvents="none"
        style={tintStyle}
        className="absolute inset-0 border-y border-brand/30 bg-brand/10"
      />
      <Text className="w-[18px] font-mono text-[13px] font-semibold text-brand">
        {index + 1}
      </Text>
      <Text className="flex-1 text-[15px]" numberOfLines={1}>
        {title}
      </Text>
      <Button
        variant="ghost"
        size="icon"
        accessibilityLabel={`Remove ${title}`}
        onPress={onRemove}
      >
        <Icon as={X} className="size-4 text-muted-foreground" />
      </Button>
      <GestureDetector gesture={drag}>
        <View
          className="h-full w-10 items-center justify-center"
          accessibilityLabel={`Move ${title}`}
          accessibilityRole="adjustable"
          accessibilityActions={[
            { name: "increment", label: "Move down" },
            { name: "decrement", label: "Move up" },
          ]}
          onAccessibilityAction={({ nativeEvent: { actionName } }) => {
            const target = index + (actionName === "increment" ? 1 : -1);
            if (target >= 0 && target < count) onMove(index, target);
          }}
        >
          <Icon as={GripVertical} className="size-5 text-muted-foreground" />
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

/** The exercises picked so far, in the order they will be added. */
export function PickedExercises({
  exercises,
  onMove,
  onRemove,
}: {
  exercises: DraftExerciseInfo[];
  onMove: (from: number, to: number) => void;
  onRemove: (id: string) => void;
}) {
  const positions = useSharedValue<Positions>(toPositions(exercises));
  const activeId = useSharedValue<string | null>(null);

  useEffect(() => {
    positions.set(toPositions(exercises));
  }, [exercises, positions]);

  return (
    <View>
      <View className="flex-row items-baseline px-5 pb-1 pt-2.5">
        <Text className="flex-1 font-mono text-[11px] font-semibold tracking-wider">
          PICKED · {exercises.length}
        </Text>
        <Text className="font-mono text-[11px] tracking-wider text-muted-foreground">
          DRAG TO REORDER
        </Text>
      </View>
      <ScrollView
        style={{ maxHeight: rowHeight * visibleRows }}
        scrollEnabled={exercises.length > visibleRows}
      >
        <View style={{ height: rowHeight * exercises.length }}>
          {exercises.map((exercise, index) => (
            <PickedRow
              key={exercise.id}
              exercise={exercise}
              index={index}
              count={exercises.length}
              positions={positions}
              activeId={activeId}
              onMove={onMove}
              onRemove={() => onRemove(exercise.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
