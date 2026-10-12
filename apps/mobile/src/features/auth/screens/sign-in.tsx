import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Wordmark } from "@/components/wordmark";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SocialSignIn } from "../components/social-sign-in";

export function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (error) {
        throw error;
      }

      router.push({ pathname: "/verify-otp", params: { email } });
    } catch (caught) {
      console.error(caught);
      const { code, status } = caught as { code?: string; status?: number };
      if (code === "INVALID_EMAIL") {
        setError("Please enter a valid email address.");
      } else if (status === 429) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background">
      <View className="flex-1 px-6 pb-safe-offset-6 pt-safe-offset-20">
        <Wordmark />

        <View className="flex-1" />

        <View className="gap-3.5">
          <View className="gap-1.5">
            <Text
              nativeID="email-label"
              className="font-mono text-[11px] font-semibold tracking-wider"
            >
              EMAIL
            </Text>
            <Input
              testID="email-input"
              accessibilityLabelledBy="email-label"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              className="h-12 rounded-none border-0 border-b-[1.5px] border-foreground bg-transparent px-0 text-[17px] shadow-none dark:bg-transparent"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
            />
          </View>

          {error && <Text className="text-sm text-destructive">{error}</Text>}

          <Button
            variant="brand"
            size="xl"
            onPress={handleSubmit}
            disabled={submitting || !email}
          >
            {submitting && <Spinner className="text-brand-foreground" />}
            <Text>Continue</Text>
          </Button>
        </View>

        <SocialSignIn />
      </View>
    </KeyboardAvoidingView>
  );
}
