import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import LoginScreen from "../(auth)/login";
import { useTheme } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user } = useAuth();
  const theme = useTheme();

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

  if (!user) return <LoginScreen />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={[styles.headerText, { color: theme.colors.text }]}>
        Profile
      </Text>
      <ScrollView>
        <Text style={[styles.user, { color: theme.colors.text }]}>
          Logged in as {user.email}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  pageHeader: {
    height: 100,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    margin: 20,
  },
  user: {
    fontSize: 18,
    textAlign: "center",
  },
});
