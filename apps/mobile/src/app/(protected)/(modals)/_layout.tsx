import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="settings"
        options={{ title: "Settings", headerLargeTitle: true }}
      />
      <Stack.Screen name="profile/edit-username" />
    </Stack>
  );
}
