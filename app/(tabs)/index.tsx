import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  SafeAreaView,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import LoginScreen from "../(auth)/login";
import { useTheme } from "@react-navigation/native";

export default function ProfileScreen() {
  const { user } = useAuth();
  const theme = useTheme();

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
