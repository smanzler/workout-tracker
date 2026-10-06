import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "expo-router/react-navigation";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const MODAL_WIDTH = 280;
const MODAL_MARGIN = 16;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function InfoModal() {
  const { colors } = useTheme();
  const { description, title, x, y } = useLocalSearchParams<{
    description: string;
    title: string;
    x: string;
    y: string;
  }>();

  const xPos = Number(x);
  const yPos = Number(y);

  const modalX = Math.min(
    Math.max(MODAL_MARGIN, xPos - MODAL_WIDTH / 2),
    SCREEN_WIDTH - MODAL_WIDTH - MODAL_MARGIN,
  );

  const modalY = yPos + 20;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={StyleSheet.absoluteFill}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()}>
        <BlurView style={StyleSheet.absoluteFill} intensity={30} />
      </Pressable>
      <BlurView
        intensity={100}
        tint="systemChromeMaterial"
        style={[
          styles.container,
          {
            position: "absolute",
            left: modalX,
            top: modalY,
            width: MODAL_WIDTH,
            overflow: "hidden",
            backgroundColor: "transparent",
          },
        ]}
      >
        <View style={styles.header}>
          <Ionicons
            name="information-circle"
            size={24}
            color={colors.primary}
          />
          <ThemedText type="defaultSemiBold">{title}</ThemedText>
        </View>
        <ThemedText
          style={{
            fontSize: 15,
            lineHeight: 22,
            opacity: 0.8,
          }}
        >
          {description}
        </ThemedText>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
