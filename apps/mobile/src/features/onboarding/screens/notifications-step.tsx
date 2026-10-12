import { StepTitle } from "@/components/step-title";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRegisterDevice } from "@/features/notifications/hooks/use-push-notification-registration";
import { requestPushPermission } from "@/features/notifications/lib/permissions";
import { useState } from "react";
import { View } from "react-native";
import { useOnboardingStore } from "../stores/onboarding-store";

const examples = [
  { user: "alexk", text: "gave kudos to Push Day", when: "2M" },
  { user: "jordan.lifts", text: "started following you", when: "1H" },
  { user: "mia_r", text: "gave kudos to Leg Day", when: "3H" },
];

export default function NotificationsStep() {
  const complete = useOnboardingStore((state) => state.complete);
  const registerDevice = useRegisterDevice();
  const [requesting, setRequesting] = useState(false);

  // App Store review rejects a pre-prompt that can skip the system prompt, so
  // the only action always shows it.
  const handleContinue = async () => {
    setRequesting(true);
    try {
      await requestPushPermission();
      await registerDevice();
    } catch (error) {
      console.warn("Failed to request permission", error);
    } finally {
      complete();
    }
  };

  return (
    <View className="flex-1 bg-background pb-safe-offset-6 pt-safe-offset-20">
      <View className="px-6">
        <StepTitle label="STEP 2 OF 2" title="Know when friends react">
          Get a notification when someone follows you or gives kudos to your
          workout.
        </StepTitle>
      </View>

      <View
        accessibilityLabel="Example notifications"
        className="mt-9 border-t-[1.5px] border-foreground"
      >
        {examples.map(({ user, text, when }) => (
          <View
            key={user}
            className="flex-row items-center gap-3 border-b border-border px-6 py-3"
          >
            <View className="size-9 items-center justify-center rounded-full bg-brand/10">
              <Text className="text-[13px] font-semibold uppercase text-brand">
                {user.slice(0, 2)}
              </Text>
            </View>
            <Text className="flex-1 text-sm">
              <Text className="text-sm font-semibold">{user}</Text> {text}
            </Text>
            <Text className="font-mono text-[11px] text-muted-foreground">
              {when}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-1" />

      <View className="px-6">
        <Button
          variant="brand"
          size="xl"
          onPress={handleContinue}
          disabled={requesting}
        >
          <Text>Continue</Text>
        </Button>
      </View>
    </View>
  );
}
