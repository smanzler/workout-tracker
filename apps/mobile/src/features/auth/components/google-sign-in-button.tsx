import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Alert } from "react-native";
import {
  GoogleOneTapSignIn,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";
import { StyledAntDesign } from "./styled-ant-design";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    setLoading(true);
    try {
      await GoogleOneTapSignIn.checkPlayServices();

      // Try a saved account first, then a new one, then the full picker.
      let response = await GoogleOneTapSignIn.signIn();
      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.createAccount();
      }
      if (isNoSavedCredentialFoundResponse(response)) {
        response = await GoogleOneTapSignIn.presentExplicitSignIn();
      }
      if (!isSuccessResponse(response)) return;

      const { error } = await authClient.signIn.social({
        provider: "google",
        idToken: { token: response.data.idToken },
      });
      if (error) throw error;
    } catch (error) {
      console.error(error);
      Alert.alert("Could not sign in with Google", "Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" disabled={loading} onPress={signIn}>
      {loading ? (
        <Spinner />
      ) : (
        <StyledAntDesign name="google" className="text-primary" />
      )}
      <Text>Sign in with Google</Text>
    </Button>
  );
}
