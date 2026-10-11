import { BodyScrollView } from "@/components/ui/body-scroll-view";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { usernameSchema } from "@rep/shared";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { useMyProfile } from "../hooks/use-my-profile";
import { useUpdateUsername } from "../hooks/use-update-username";

export default function EditUsername() {
  const { data: profile } = useMyProfile();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateUsername, isPending } = useUpdateUsername();

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
    <BodyScrollView keyboardShouldPersistTaps="handled">
      <Stack.Screen
        options={{
          title: "Username",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <FieldGroup className="pb-8">
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input
            placeholder="Enter your username"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setError(null);
            }}
            autoFocus
          />
          {error ? (
            <FieldError>{error}</FieldError>
          ) : (
            <FieldDescription>
              Letters, numbers and underscores
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>
      <Button
        onPress={save}
        disabled={isPending || username === profile?.username}
      >
        {isPending && <Spinner className="text-secondary" />}
        <Text>Save</Text>
      </Button>
    </BodyScrollView>
  );
}
