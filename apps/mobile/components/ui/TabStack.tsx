import { Stack } from "expo-router";

export default function TabStack({
  name,
  headerTitle,
}: {
  name: string;
  headerTitle: string;
}) {
  return (
    <Stack>
      <Stack.Screen
        name={name}
        options={{
          headerShown: true,
          headerTitle,
          ...(process.env.EXPO_OS !== "ios"
            ? {}
            : {
                headerLargeTitle: true,
                headerTransparent: true,
                headerBlurEffect: "systemChromeMaterial",
                headerLargeTitleShadowVisible: false,
                headerShadowVisible: true,
                headerLargeStyle: {
                  backgroundColor: "transparent",
                },
              }),
        }}
      />
    </Stack>
  );
}
