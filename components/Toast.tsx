import { getProfileImageUrl, useProfile } from "@/api/profile";
import { useTheme } from "@react-navigation/native";
import { useEffect } from "react";
import { StyleSheet, View, Dimensions, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./ThemedText";
import { Image } from "expo-image";
import { useToast } from "@/hooks/useToast";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Toast = () => {
  const { isVisible, message, hide } = useToast();
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();
  const { data: actorProfile, isLoading } = useProfile(message?.actor_id);

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible && !isLoading && actorProfile) {
      translateY.value = withTiming(top + 10, {
        duration: 500,
        easing: Easing.bezier(0.2, 0.0, 0.0, 1.0),
      });
      opacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.ease,
      });

      const timeout = setTimeout(() => {
        translateY.value = withTiming(-100, {
          duration: 500,
          easing: Easing.bezier(0.4, 0.0, 1.0, 1.0),
        });
        opacity.value = withTiming(0, {
          duration: 250,
          easing: Easing.ease,
        });

        const hideTimeout = setTimeout(() => {
          hide();
        }, 300);

        return () => clearTimeout(hideTimeout);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isVisible, hide, isLoading, actorProfile, top]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle]}
      onPress={() => router.push("/(modals)/notifications")}
    >
      <View style={[styles.toast, { backgroundColor: colors.card }]}>
        {actorProfile?.profile.id && (
          <Image
            source={{ uri: getProfileImageUrl(actorProfile.profile.id) }}
            style={styles.avatar}
            cachePolicy="memory"
          />
        )}
        <ThemedText type="defaultSemiBold">
          {actorProfile?.profile.username}
        </ThemedText>
        <ThemedText type="default">
          {message?.type === "follow"
            ? " started following you!"
            : message?.type === "like"
            ? " liked your post!"
            : " sent you a follow request!"}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    width: width,
    alignItems: "center",
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxWidth: width * 0.9,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
});
