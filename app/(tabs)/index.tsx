import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  SafeAreaView,
  Button,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import LoginScreen from "../(auth)/login";
import { useTheme } from "@react-navigation/native";
import { mySync } from "@/db/sync";
import { useSync } from "@/providers/SyncProvider";
import database from "@/db";

export default function ProfileScreen() {
  const { user } = useAuth();
  const { updateLastSync } = useSync();
  const theme = useTheme();

  async function resetDatabase() {
    await database.write(async () => {
      await database.unsafeResetDatabase();
      console.log("Database reset successfully!");
    });
  }

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
        <Button
          title="Sync"
          onPress={() => mySync(user, updateLastSync, () => {})}
        />
        {/* <Button title="Reset DB" onPress={resetDatabase} /> */}
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
