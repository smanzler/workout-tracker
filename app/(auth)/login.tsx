import React, { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@react-navigation/native";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { migrateUserData } from "@/db";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  async function signInWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);

    if (session?.user) {
      await migrateUserData(session.user.id);
    }

    setLoading(false);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen options={{ headerTitle: "Login" }} />
      <View style={{ flex: 1, padding: 20 }}>
        <View>
          <TextInput
            onChangeText={(text) => setEmail(text)}
            value={email}
            label="Email"
            autoCapitalize={"none"}
            variant="filled"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.verticallySpaced}>
          <TextInput
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            label="Password"
            autoCapitalize={"none"}
            variant="filled"
          />
        </View>
        <Button
          style={{ marginBottom: 20 }}
          disabled={loading || !email || !password}
          onPress={() => signInWithEmail()}
        >
          Sign in
        </Button>
        <ThemedText type="defaultSemiBold" style={styles.signupText}>
          Don't have an account?
        </ThemedText>
        <Button
          disabled={loading}
          onPress={() => router.push("/(auth)/signup")}
          variant="outline"
        >
          Sign up
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 40,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  signupText: {
    marginBottom: 5,
    textAlign: "center",
  },
});
