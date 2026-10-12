import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Wordmark } from "@/components/wordmark";
import { View } from "react-native";
import { useOnboardingStore } from "../stores/onboarding-store";

const points = [
  {
    title: "Log every set",
    text: "Start from a routine or an empty workout. Your last numbers show next to each set.",
  },
  {
    title: "See your records",
    text: "Max weight, est. 1RM and volume records light up the moment you set them.",
  },
  {
    title: "Train with friends",
    text: "Follow friends, see their workouts and give kudos.",
  },
];

export default function Welcome() {
  const welcome = useOnboardingStore((state) => state.welcome);

  return (
    <View className="flex-1 bg-background pb-safe-offset-6 pt-safe-offset-20">
      <View className="px-6">
        <Wordmark />
      </View>

      <View className="mt-11 border-t-[1.5px] border-foreground">
        {points.map(({ title, text }, index) => (
          <View
            key={title}
            className="flex-row gap-4 border-b border-border px-6 py-4"
          >
            <Text className="pt-0.5 font-mono text-[13px] font-semibold text-brand">
              {String(index + 1).padStart(2, "0")}
            </Text>
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold">{title}</Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                {text}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View className="flex-1" />

      <View className="px-6">
        <Button variant="brand" size="xl" onPress={welcome}>
          <Text>Get Started</Text>
        </Button>
      </View>
    </View>
  );
}
