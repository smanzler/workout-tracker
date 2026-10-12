import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StepTitle } from "@/components/step-title";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { LineField } from "@/components/line-field";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useMenu } from "@/hooks/use-menu";
import { pickImage, takePhoto } from "@/lib/image";
import { usernameSchema } from "@rep/shared";
import { Link } from "expo-router";
import { useState } from "react";
import { Camera } from "lucide-react-native";
import { Alert, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
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
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-background">
      <View className="flex-1 px-6 pb-safe-offset-6 pt-safe-offset-20">
        <StepTitle label="STEP 1 OF 2" title="Pick a username">
          Friends find you by it.
        </StepTitle>

        <View className="flex-row items-center gap-3.5 pt-8">
          {avatar ? (
            <Avatar className="size-[72px]" alt="Your photo">
              <AvatarImage source={{ uri: avatar }} />
              <AvatarFallback />
            </Avatar>
          ) : (
            <View className="size-[72px] items-center justify-center rounded-full border-[1.5px] border-dashed border-muted-foreground/60">
              <Icon as={Camera} className="size-6 text-muted-foreground" />
            </View>
          )}
          <View className="flex-1 gap-0.5">
            <Text className="text-[15px] font-medium">Profile photo</Text>
            <Text className="font-mono text-[11px] text-muted-foreground">
              OPTIONAL
            </Text>
          </View>
          <Button variant="strong" size="sm" onPress={handleAvatarPress}>
            <Text>{avatar ? "Change Photo" : "Add Photo"}</Text>
          </Button>
        </View>

        <View className="pt-7">
          <LineField
            label="USERNAME"
            prefix="@"
            placeholder="username"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
            className="font-mono"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setUsernameError(null);
            }}
            hint="Letters, numbers and underscores"
            error={usernameError}
          />
        </View>

        <View className="flex-1" />

        <Text className="pb-3.5 text-[13px] leading-5 text-muted-foreground">
          By continuing you agree to the{" "}
          <Link href="/terms" className="text-foreground underline">
            Terms of Use
          </Link>
          , including zero tolerance for objectionable content and abusive
          behavior.
        </Text>

        <Button
          variant="brand"
          size="xl"
          onPress={handleSubmit}
          disabled={isPending || !username}
        >
          {isPending && <Spinner className="text-brand-foreground" />}
          <Text>Agree and Continue</Text>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
