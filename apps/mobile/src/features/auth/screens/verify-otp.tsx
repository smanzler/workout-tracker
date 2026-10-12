import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { AuthTitle } from "../components/auth-title";
import { OtpInput, type OtpInputRef } from "../components/otp-input";

const RESEND_COOLDOWN_SECONDS = 60;

const OTP_ERROR_MESSAGES: Record<string, string> = {
  INVALID_OTP: "That code isn't right. Please try again.",
  OTP_EXPIRED: "That code has expired. Request a new one.",
  TOO_MANY_ATTEMPTS: "Too many attempts. Request a new code.",
};

export function VerifyOtp() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const { refetch: refetchSession } = authClient.useSession();

  const otpRef = useRef<OtpInputRef>(null);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
    if (!email || otp.length !== 6) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { error } = await authClient.signIn.emailOtp({ email, otp });

      if (error) {
        throw error;
      }

      // The session-signal update that better-auth fires internally after
      // sign-in is wrapped in a setTimeout, which is unreliable on Android
      // when the JS thread is otherwise idle. Refetch explicitly so the
      // session hook (and the Stack.Protected guard) updates immediately.
      await refetchSession();
    } catch (caught) {
      console.error(caught);
      const code = (caught as { code?: string })?.code;
      setError(
        (code && OTP_ERROR_MESSAGES[code]) ??
          "Something went wrong. Please try again.",
      );
      setOtp("");
      otpRef.current?.clear();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) {
      return;
    }

    setResending(true);
    setError(null);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (error) {
        throw error;
      }

      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      console.error(error);
      setError("Couldn't send a new code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <View className="flex-1 gap-8 bg-background px-6 pt-safe-offset-20">
        <AuthTitle label="NO EMAIL" title="Something went wrong">
          We couldn&apos;t find an email to verify.
        </AuthTitle>
        <Button variant="brand" size="xl" onPress={() => router.replace("/")}>
          <Text>Back to Sign In</Text>
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background">
      <View className="flex-1 px-6 pb-safe-offset-6 pt-safe-offset-20">
        <AuthTitle label="CODE SENT" title="Enter code">
          We sent a 6-digit code to{" "}
          <Text className="font-mono text-[15px] text-foreground">{email}</Text>
        </AuthTitle>

        <View className="pt-8">
          <OtpInput
            ref={otpRef}
            onTextChange={(text) => {
              setOtp(text);
              setError(null);
            }}
          />
        </View>

        {error && (
          <Text className="pt-3 text-sm text-destructive">{error}</Text>
        )}

        <View className="flex-row items-center justify-between pt-3">
          <Text className="font-mono text-xs uppercase text-muted-foreground">
            {resendCooldown > 0
              ? `Resend in 0:${String(resendCooldown).padStart(2, "0")}`
              : "Didn't get a code?"}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onPress={handleResend}
            disabled={resending || resendCooldown > 0}
          >
            <Text>Resend Code</Text>
          </Button>
        </View>

        <View className="flex-1" />

        <View className="gap-1">
          <Button
            variant="brand"
            size="xl"
            onPress={handleSubmit}
            disabled={submitting || otp.length !== 6}
          >
            {submitting && <Spinner className="text-brand-foreground" />}
            <Text>Continue</Text>
          </Button>
          <Button variant="ghost" onPress={() => router.replace("/")}>
            <Text>Use a Different Email</Text>
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
