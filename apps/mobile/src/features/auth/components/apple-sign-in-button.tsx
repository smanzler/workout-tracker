import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import * as AppleAuthentication from "expo-apple-authentication";
import { useState } from "react";
import { Alert } from "react-native";
import { StyledAntDesign } from "./styled-ant-design";

const isCanceled = (error: unknown) =>
  error instanceof Error &&
  "code" in error &&
  error.code === "ERR_REQUEST_CANCELED";

export function AppleSignInButton() {
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error("No identity token");

      const { error } = await authClient.signIn.social({
        provider: "apple",
        idToken: { token: credential.identityToken },
      });
      if (error) throw error;
    } catch (error) {
      if (!isCanceled(error)) {
        console.error(error);
        Alert.alert("Could not sign in with Apple", "Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" disabled={loading} onPress={signIn}>
      {loading ? (
        <Spinner />
      ) : (
        <StyledAntDesign name="apple" className="text-primary" />
      )}
      <Text>Sign in with Apple</Text>
    </Button>
  );
}
