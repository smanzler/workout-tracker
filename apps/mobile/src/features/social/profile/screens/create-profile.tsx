import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useMenu } from "@/hooks/use-menu";
import { pickImage, takePhoto } from "@/lib/image";
import { usernameSchema } from "@rep/shared";
import { Link, Stack } from "expo-router";
import { useState } from "react";
import { Pressable } from "@/components/ui/pressable";
import { Alert, View } from "react-native";
import { useCreateProfile } from "../hooks/use-create-profile";

export default function CreateProfile() {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | undefined>();
  const showMenu = useMenu();

  const { mutate, isPending } = useCreateProfile();

  const handleSubmit = () => {
    const parsed = usernameSchema.safeParse(username);

    if (!parsed.success) {
      setUsernameError(parsed.error.issues[0]?.message ?? "Invalid username");
      return;
    }

    mutate(
      { username: parsed.data, avatar },
      {
        onSuccess: ({ avatarError }) => {
          if (!avatarError) return;
          Alert.alert(
            "Avatar upload failed",
            "Your profile was created, but we couldn't upload your avatar. You can try again in settings.",
          );
        },
        onError: (error) => setUsernameError(error.message),
      },
    );
  };

  const handleAvatarPress = () =>
    showMenu([
      {
        label: "Take Photo",
        onSelect: async () => setAvatar((await takePhoto()) ?? avatar),
      },
      {
        label: "Photo Library",
        onSelect: async () => setAvatar((await pickImage()) ?? avatar),
      },
    ]);

  return (
    <BodyScrollView keyboardShouldPersistTaps="handled">
      <Stack.Screen
        options={{
          headerTitle: "Create Profile",
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <View>
        <Text variant="h1" className="text-left mt-8">
          One more step
        </Text>
        <Text variant="lead" className="pb-8">
          Pick a username so friends can find you
        </Text>

        <FieldGroup className="pb-8">
          <Field>
            <FieldLabel>Avatar</FieldLabel>
            <Pressable onPress={handleAvatarPress}>
              <Avatar className="size-32" alt="Your avatar">
                <AvatarImage source={{ uri: avatar }} />
                <AvatarFallback />
              </Avatar>
            </Pressable>
          </Field>
          <Field>
            <FieldLabel>Username</FieldLabel>
            <Input
              placeholder="Enter your username"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError(null);
              }}
            />
            {usernameError ? (
              <FieldError>{usernameError}</FieldError>
            ) : (
              <FieldDescription>
                Letters, numbers and underscores
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>

        <Text variant="muted" className="pb-4">
          By continuing you agree to the{" "}
          <Link href="/terms" className="text-foreground underline">
            Terms of Use
          </Link>
          , including zero tolerance for objectionable content and abusive
          behavior.
        </Text>

        <Button onPress={handleSubmit} disabled={isPending || !username}>
          {isPending && <Spinner className="text-secondary" />}
          <Text>Agree and Continue</Text>
        </Button>
      </View>
    </BodyScrollView>
  );
}
