import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Animated } from "react-native";
import { useNavigation } from "expo-router";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;

  const textOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Profile",
      headerStyle: { backgroundColor: "white", shadowOpacity: textOpacity },
      headerTitleStyle: {
        opacity: textOpacity,
      },
    });
  }, [navigation, textOpacity]);

  return (
    <ScrollView
      style={styles.container}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      <View style={styles.pageHeader}>
        <Text style={styles.headerText}>Profile</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  pageHeader: {
    height: 100,
  },
  headerText: { fontSize: 30, fontWeight: "bold", color: "black" },
});
