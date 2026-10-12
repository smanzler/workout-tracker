import { LineField } from "@/components/line-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { usernameSchema } from "@rep/shared";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useMyProfile } from "../hooks/use-my-profile";
import { useUpdateUsername } from "../hooks/use-update-username";

export default function EditUsername() {
  const { data: profile } = useMyProfile();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateUsername, isPending } = useUpdateUsername();
  const canSave = !isPending && username !== profile?.username;

  const save = () => {
    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid username");
      return;
    }

    updateUsername(
      { username: parsed.data },
      {
        onSuccess: () => router.back(),
        onError: (caught) =>
          setError(
            caught.data?.code === "CONFLICT"
              ? "That username is taken."
              : "Could not save your username. Try again.",
          ),
      },
    );
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: "Username",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <View className="flex-1 px-6 pb-safe-offset-6 pt-6">
        <LineField
          label="USERNAME"
          prefix="@"
          placeholder="username"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => canSave && save()}
          className="font-mono"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setError(null);
          }}
          hint="Letters, numbers and underscores"
          error={error}
          autoFocus
        />

        <View className="flex-1" />

        <Button variant="brand" size="xl" onPress={save} disabled={!canSave}>
          {isPending && <Spinner className="text-brand-foreground" />}
          <Text>Save</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
