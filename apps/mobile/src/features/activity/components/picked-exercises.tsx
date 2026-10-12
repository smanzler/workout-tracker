import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { GripVertical, X } from "lucide-react-native";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { DraftExerciseInfo } from "../lib/draft";

// Every row has this height in points, so that a drag distance gives a position.
const rowHeight = 44;
const visibleRows = 4;

function PickedRow({
  exercise,
  index,
  count,
  onMove,
  onRemove,
}: {
  exercise: DraftExerciseInfo;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  const offset = useSharedValue(0);
  const position = useSharedValue(index);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    position.set(index);
  }, [index, position]);

  const drag = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      isDragging.set(true);
    })
    .onChange(({ changeY }) => {
      const from = position.get();
      const moved = offset.get() + changeY;
      const to = Math.min(
        count - 1,
        Math.max(0, from + Math.round(moved / rowHeight)),
      );

      // Keep the row under the finger while the list moves it.
      offset.set(moved - (to - from) * rowHeight);
      if (to === from) return;

      scheduleOnRN(onMove, from, to);
      position.set(to);
    })
    .onFinalize(() => {
      isDragging.set(false);
      offset.set(withTiming(0, { duration: 120 }));
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.get() }],
    zIndex: isDragging.get() ? 1 : 0,
    opacity: isDragging.get() ? 0.9 : 1,
  }));

  return (
    <Animated.View
      style={[{ height: rowHeight }, style]}
      className="flex-row items-center gap-3 bg-background pl-5 pr-2"
    >
      <Text className="w-[18px] font-mono text-[13px] font-semibold text-brand">
        {index + 1}
      </Text>
      <Text className="flex-1 text-[15px]" numberOfLines={1}>
        {exercise.title}
      </Text>
      <Button
        variant="ghost"
        size="icon"
        accessibilityLabel={`Remove ${exercise.title}`}
        onPress={onRemove}
      >
        <Icon as={X} className="size-4 text-muted-foreground" />
      </Button>
      <GestureDetector gesture={drag}>
        <View
          className="h-full w-8 items-center justify-center"
          accessibilityLabel={`Move ${exercise.title}`}
          accessibilityRole="adjustable"
          accessibilityActions={[
            { name: "increment", label: "Move down" },
            { name: "decrement", label: "Move up" },
          ]}
          onAccessibilityAction={({ nativeEvent: { actionName } }) => {
            const step = actionName === "increment" ? 1 : -1;
            const target = index + step;
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
        {exercises.map((exercise, index) => (
          <PickedRow
            key={exercise.id}
            exercise={exercise}
            index={index}
            count={exercises.length}
            onMove={onMove}
            onRemove={() => onRemove(exercise.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
