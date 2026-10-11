import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { requestPushPermission } from "@/features/notifications/lib/permissions";
import { Bell } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { useOnboardingStore } from "../stores/onboarding-store";

export default function NotificationsStep() {
  const complete = useOnboardingStore((state) => state.complete);
  const [requesting, setRequesting] = useState(false);

  // App Store review rejects a pre-prompt that can skip the system prompt, so
  // the only action always shows it.
  const handleContinue = async () => {
    setRequesting(true);
    try {
      await requestPushPermission();
    } catch (error) {
      console.warn("Failed to request permission", error);
    } finally {
      complete();
    }
  };

  return (
    <View className="flex-1 bg-background pt-safe pb-safe-offset-4">
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <View className="mb-4 size-20 items-center justify-center rounded-3xl bg-muted">
          <Icon as={Bell} className="size-9" />
        </View>
        <Text variant="h3" className="text-center">
          Stay in the loop
        </Text>
        <Text className="text-center leading-6 text-muted-foreground">
          Get a notification when someone follows you or gives kudos to your
          workout.
        </Text>
      </View>
      <View className="px-6">
        <Button size="lg" onPress={handleContinue} disabled={requesting}>
          <Text className="text-base">Continue</Text>
        </Button>
      </View>
    </View>
  );
}
