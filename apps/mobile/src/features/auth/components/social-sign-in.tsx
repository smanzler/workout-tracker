import { Text } from "@/components/ui/text";
import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { isGoogleSignInEnabled } from "../lib/google";
import { AppleSignInButton } from "./apple-sign-in-button";
import { GoogleSignInButton } from "./google-sign-in-button";

/** The Apple and Google buttons that this device and build support. */
export function SocialSignIn() {
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
  }, []);

  if (!isAppleAvailable && !isGoogleSignInEnabled) return null;

  return (
    <>
      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-border" />
        <Text className="text-muted-foreground">or</Text>
        <View className="h-px flex-1 bg-border" />
      </View>
      {isAppleAvailable && <AppleSignInButton />}
      {isGoogleSignInEnabled && <GoogleSignInButton />}
    </>
  );
}
