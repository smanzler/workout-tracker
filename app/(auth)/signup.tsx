import React, { useState, useEffect } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useTheme } from "expo-router/react-navigation";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import { migrateUserData } from "@/db";
import { PostgrestError } from "@supabase/supabase-js";
import { checkUsernameAvailability } from "@/api/profile";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { EulaAgreement } from "@/components/EulaAgreement";

export default function SignupScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [showEula, setShowEula] = useState(false);
  const theme = useTheme();

  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    if (username !== debouncedUsername) {
      setIsDebouncing(true);
    } else {
      setIsDebouncing(false);
    }
  }, [username, debouncedUsername]);

  const { data: isUsernameAvailable, isLoading: checkingUsername } = useQuery({
    queryKey: ["username", debouncedUsername],
    queryFn: () => checkUsernameAvailability(debouncedUsername),
    enabled:
      debouncedUsername.length >= 4 && /^[a-zA-Z0-9]+$/.test(debouncedUsername),
  });

  const isValidUsername = (username: string) => {
    return /^[a-zA-Z0-9]*$/.test(username);
  };

  const handleUsernameChange = (text: string) => {
    if (isValidUsername(text)) {
      setUsername(text);
      setError(undefined);
    } else {
      setError("Username can only contain letters and numbers");
    }
  };

  const getUsernameIcon = () => {
    if (!username || username.length < 4) return undefined;
    if (checkingUsername || isDebouncing) return undefined;
    if (!isValidUsername(username)) return "close-circle";
    return isUsernameAvailable ? "checkmark-circle" : "close-circle";
  };

  const getUsernameIconColor = () => {
    if (!isValidUsername(username)) return String(theme.colors.notification);
    if (!isUsernameAvailable) return String(theme.colors.notification);
    return String(theme.colors.primary);
  };

  const handleSignUpPress = () => {
    if (!isValidUsername(username)) {
      Alert.alert("Error", "Username can only contain letters and numbers");
      return;
    }

    if (!isUsernameAvailable || isDebouncing) {
      Alert.alert("Error", "Please wait for username validation to complete");
      return;
    }

    setShowEula(true);
  };

  const isButtonDisabled =
    loading ||
    !email ||
    !password ||
    !username ||
    username.length < 4 ||
    !isUsernameAvailable ||
    checkingUsername ||
    isDebouncing ||
    !isValidUsername(username);

  async function signUpWithEmail() {
    setLoading(true);
    setShowEula(false);

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) throw error;

      const { error: profileError } = await supabase.rpc("create_profile", {
        username,
      });

      if (profileError) throw profileError;

      if (session?.user) {
        await migrateUserData(session.user.id);
      }

      router.back();
    } catch (error: any) {
      if ("message" in error && typeof error.message === "string") {
        Alert.alert("Error", error.message);
      }

      console.error("Error signing up:", error);
    } finally {
      setLoading(false);
    }
  }

  if (showEula) {
    return (
      <EulaAgreement
        onAgree={signUpWithEmail}
        onDecline={() => setShowEula(false)}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <View>
          <TextInput
            onChangeText={handleUsernameChange}
            value={username}
            label="Username"
            autoCapitalize={"none"}
            variant="filled"
            error={error}
            rightIcon={getUsernameIcon()}
            rightIconColor={getUsernameIconColor()}
            isLoading={checkingUsername || isDebouncing}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <TextInput
            onChangeText={(text) => setEmail(text)}
            value={email}
            label="Email"
            autoCapitalize={"none"}
            variant="filled"
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
            onSubmitEditing={() => {
              if (!isButtonDisabled) {
                handleSignUpPress();
              }
            }}
          />
        </View>
        <Button disabled={isButtonDisabled} onPress={handleSignUpPress}>
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
});
