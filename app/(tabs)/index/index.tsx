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
import { BodyScrollView } from "@/components/BodyScrollViiew";
import { ThemedText } from "@/components/ThemedText";

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
    <BodyScrollView style={{ paddingHorizontal: 20 }}>
      <Stack.Screen options={{ headerTitle: "Profile" }} />
      <ThemedText type="defaultSemiBold" style={styles.user}>
        Logged in as {user.email}
      </ThemedText>
      <Button
        style={{ marginBottom: 10 }}
        onPress={() => mySync(user, updateLastSync, () => {})}
      >
        Sync
      </Button>
      <Button
        style={{}}
        onPress={() => supabase.auth.signOut()}
        variant="outline"
      >
        Log Out
      </Button>
      {/* <Button onPress={resetDatabase}>Reset DB</Button> */}
    </BodyScrollView>
  );
}

const styles = StyleSheet.create({
  user: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 30,
  },
});
