import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { Share, X } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const starAnimation = require("../assets/star.json");

const starDelaysMs = [400, 500, 600];

function Star({ delayMs }: { delayMs: number }) {
  const ref = useRef<LottieView>(null);

  useEffect(() => {
    ref.current?.reset();
    const timeout = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      ref.current?.play();
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [delayMs]);

  return (
    <LottieView
      ref={ref}
      source={starAnimation}
      loop={false}
      style={{ width: 50, height: 50 }}
    />
  );
}

export function SummaryHeader({ onShare }: { onShare: () => void }) {
  const { top } = useSafeAreaInsets();

  return (
    <BlurView
      intensity={100}
      tint="systemChromeMaterial"
      style={{ paddingTop: top }}
    >
      <View className="flex-row items-center justify-between px-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          accessibilityLabel="Close"
          onPress={() => router.back()}
        >
          <Icon as={X} />
        </Button>
        <Text variant="h3">Congratulations!</Text>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          accessibilityLabel="Share"
          onPress={onShare}
        >
          <Icon as={Share} />
        </Button>
      </View>
      <View className="flex-row justify-center pb-2">
        {starDelaysMs.map((delayMs) => (
          <Star key={delayMs} delayMs={delayMs} />
        ))}
      </View>
    </BlurView>
  );
}
