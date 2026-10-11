import { Stack } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: true }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="start-workout">
        <NativeTabs.Trigger.Label>Workout</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="figure.strengthtraining.traditional"
          md="fitness_center"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="clock.arrow.circlepath" md="history" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="exercises">
        <NativeTabs.Trigger.Label>Exercises</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="dumbbell.fill" md="exercise" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="you">
        <NativeTabs.Trigger.Label>You</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
