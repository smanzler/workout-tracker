import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  SafeAreaView,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@react-navigation/native";
import { mySync } from "@/db/sync";
import { useSync } from "@/providers/SyncProvider";
import database from "@/db";
import Button from "@/components/Button";
import { Stack } from "expo-router";
import LoginScreen from "@/app/(auth)/login";
import { supabase } from "@/lib/supabase";

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
      <ScrollView style={{ padding: 20 }}>
        <Text style={[styles.user, { color: theme.colors.text }]}>
          Logged in as {user.email}
        </Text>
        <Button
          style={{ marginBottom: 10 }}
          onPress={() => mySync(user, updateLastSync, () => {})}
        >
          Sync
        </Button>
        <Button style={{}} onPress={() => supabase.auth.signOut()}>
          Log Out
        </Button>
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
    marginBottom: 10,
  },
});
