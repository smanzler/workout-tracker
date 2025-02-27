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
    <View style={styles.container}>
      <ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.headerText}>Profile</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.text}>
            Scroll down to fade the title into the header...
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageHeader: {
    height: 100,
  },
  headerText: { fontSize: 30, fontWeight: "bold", color: "black" },
  content: { height: 1200, padding: 20 },
  text: { fontSize: 18, textAlign: "center", marginTop: 50, color: "black" },
});
