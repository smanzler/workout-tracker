import { Stack } from "expo-router";

// With `withAnchor`, a push to the picker keeps the form under it.
export const unstable_settings = { initialRouteName: "index" };

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Edit Workout" }} />
      <Stack.Screen
        name="add-exercises"
        options={{ title: "Add Exercises", headerBackTitle: "Workout" }}
      />
    </Stack>
  );
}
