import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Text } from "@react-navigation/elements";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useWorkout } from "@/providers/WorkoutProvider";
import { ThemedText } from "../ThemedText";
import { router } from "expo-router";

export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { colors } = useTheme();
  const { activeWorkoutId } = useWorkout();

  return (
    <BlurView
      intensity={80}
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.text
            .replace("rgb", "rgba")
            .replace(")", ", 0.1)"),
        },
      ]}
    >
      {activeWorkoutId && (
        <Pressable
          style={styles.resumeContainer}
          onPress={() => router.push("/(modals)/workout")}
        >
          <ThemedText type="defaultSemiBold">Resume Workout</ThemedText>
        </Pressable>
      )}

      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

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
                }}
              >
                {label.toString()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 25,
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 25,
    overflow: "hidden",
    borderCurve: "continuous",
  },
  resumeContainer: {
    height: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
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
