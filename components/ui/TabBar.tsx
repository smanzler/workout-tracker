import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Text } from "@react-navigation/elements";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useWorkout } from "@/providers/WorkoutProvider";
import { ThemedText } from "../ThemedText";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "@/stores/settingsStore";

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors } = useTheme();
  const { activeWorkoutId } = useWorkout();
  const { bottom } = useSafeAreaInsets();
  const showExploreTab = useSettings();

  const visibleRoutes = state.routes.filter((route) => {
    if (route.name === "explore" && !showExploreTab) {
      return false;
    }
    return true;
  });

  return (
    <View
      style={{
        paddingBottom: Math.max(bottom, 16),
        backgroundColor: colors.card,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: "hidden",
      }}
    >
      {activeWorkoutId && (
        <Pressable
          style={[styles.resumeContainer, { backgroundColor: colors.card }]}
          onPress={() => router.push("/(modals)/workout")}
        >
          <ThemedText type="defaultSemiBold">Resume Workout</ThemedText>
        </Pressable>
      )}

      <View style={styles.tabContainer}>
        {visibleRoutes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === visibleRoutes.indexOf(route);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={index}
              style={styles.tabBarItem}
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
            >
              {options.tabBarIcon &&
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? colors.primary : colors.text,
                  size: 24,
                })}
              <Text
                style={{
                  color: isFocused ? colors.primary : colors.text,
                  fontWeight: "600",
                  fontSize: 12,
                }}
              >
                {label.toString()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  resumeContainer: {
    height: 50,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 10,
  },
  tabBarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
});
