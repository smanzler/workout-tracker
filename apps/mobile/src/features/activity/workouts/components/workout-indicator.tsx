import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatTimer } from "@/lib/duration";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useElapsedSeconds } from "../hooks/use-elapsed-seconds";
import { useWorkoutSessionStore } from "../stores/workout-session-store";

// NativeTabs draws a native tab bar that has no height API, so the iOS
// offset is an estimate.
const tabBarOffset = (bottomInset: number) =>
  Platform.select({ android: 4, default: 18 + bottomInset });

/** A button above the tab bar that opens the workout in progress. */
export function WorkoutIndicator() {
  const { bottom } = useSafeAreaInsets();
  const startedAt = useWorkoutSessionStore((state) => state.startedAt);
  const seconds = useElapsedSeconds(startedAt);

  if (startedAt === null) return null;

  return (
    <View
      className="absolute inset-x-0 items-center"
      style={{ bottom: tabBarOffset(bottom) }}
    >
      <Button
        className="rounded-full bg-blue-500 active:bg-blue-500/90"
        onPress={() => router.push("/workout")}
      >
        <Text className="text-white">
          Resume Workout · {formatTimer(seconds)}
        </Text>
        <Icon as={ChevronRight} className="text-white" />
      </Button>
    </View>
  );
}
