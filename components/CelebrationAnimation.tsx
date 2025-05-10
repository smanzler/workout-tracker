import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";

const width = Dimensions.get("window").width;

export const CelebrationAnimation = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("@/assets/animations/confetti.json")}
        autoPlay
        loop={false}
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
    alignItems: "center",
  },
  animation: {
    width: width,
    height: width,
  },
});
