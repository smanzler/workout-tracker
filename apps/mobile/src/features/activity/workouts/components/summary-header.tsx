import { StyleSheet, View, TouchableOpacity, Share } from "react-native";
import React, { useEffect, useRef } from "react";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import * as Haptics from "expo-haptics";

interface SummaryHeaderProps {
  handleShare: () => void;
}

const SummaryHeader: React.FC<SummaryHeaderProps> = ({ handleShare }) => {
  const { top } = useSafeAreaInsets();
  const { colors } = useTheme();
  const lottieRef1 = useRef<LottieView>(null);
  const lottieRef2 = useRef<LottieView>(null);
  const lottieRef3 = useRef<LottieView>(null);

  useEffect(() => {
    lottieRef1.current?.reset();
    lottieRef2.current?.reset();
    lottieRef3.current?.reset();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lottieRef1.current?.play();
    }, 400);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lottieRef2.current?.play();
    }, 500);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lottieRef3.current?.play();
    }, 600);
  }, []);
  return (
    <BlurView
      style={[styles.container, { paddingTop: top, height: 100 + top }]}
      intensity={100}
      tint="systemChromeMaterial"
    >
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Congratulations!</ThemedText>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.lottieContainer}>
        <LottieView
          ref={lottieRef1}
          style={styles.lottieView}
          source={require("../assets/star.json")}
          loop={false}
        />
        <LottieView
          ref={lottieRef2}
          style={styles.lottieView}
          source={require("../assets/star.json")}
          loop={false}
        />
        <LottieView
          ref={lottieRef3}
          style={styles.lottieView}
          source={require("../assets/star.json")}
          loop={false}
        />
      </View>
    </BlurView>
  );
};

export default SummaryHeader;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  titleContainer: {
    height: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 30,
  },
  lottieContainer: {
    height: 50,
    flexDirection: "row",
  },
  lottieView: {
    width: 50,
    height: 50,
  },
});
