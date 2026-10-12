import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useStrongImport } from "@/features/activity/workouts/hooks/use-strong-import";
import { signOutOfGoogle } from "@/features/auth/lib/google";
import { useRemovePushToken } from "@/features/notifications/hooks/use-remove-push-token";
import {
  useIsWorkingOut,
  useWorkoutSessionStore,
} from "@/features/activity/workouts/stores/workout-session-store";
import { useMenu } from "@/hooks/use-menu";
import { authClient } from "@/lib/auth-client";
import { pickImage, takePhoto } from "@/lib/image";
import { router } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { SettingsRow } from "../components/settings-row";
import { ThemePicker } from "../components/theme-picker";
import { useDeleteAccount } from "../hooks/use-delete-account";
import { useMyProfile } from "../hooks/use-my-profile";
import { useUpdateProfile } from "../hooks/use-update-profile";

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="border-b border-foreground px-5 pb-1.5 pt-5 font-mono text-[11px] font-semibold tracking-wider">
      {children}
    </Text>
  );
}

export default function Settings() {
  const { data: session } = authClient.useSession();
  const { data: profile } = useMyProfile();
  const { mutate: updateAvatar, isPending: isUpdatingAvatar } =
    useUpdateProfile();
  const { mutate: deleteAccount, isPending: isDeletingAccount } =
    useDeleteAccount();
  const { importFile, isPending: isImporting } = useStrongImport();
  const isWorkingOut = useIsWorkingOut();
  const discardWorkout = useWorkoutSessionStore((state) => state.discard);
  const { mutateAsync: removePushToken } = useRemovePushToken();
  const showMenu = useMenu();

  const handleUpdateAvatar = (avatar: string | null) =>
    updateAvatar(
      { avatar },
      {
        onError: () =>
          Alert.alert("Could not update photo", "Try again in a moment."),
      },
    );

  const handleAvatarPress = () =>
    showMenu([
      {
        label: "Take Photo",
        onSelect: async () => {
          const uri = await takePhoto();
          if (uri) handleUpdateAvatar(uri);
        },
      },
      {
        label: "Photo Library",
        onSelect: async () => {
          const uri = await pickImage();
          if (uri) handleUpdateAvatar(uri);
        },
      },
      ...(profile?.avatarUrl
        ? [
            {
              label: "Remove Photo",
              destructive: true,
              onSelect: () => handleUpdateAvatar(null),
            },
          ]
        : []),
    ]);

  const handleSignOut = () => {
    if (isWorkingOut) {
      Alert.alert(
        "Workout in progress",
        "Finish or discard your workout before you sign out.",
      );
      return;
    }

    Alert.alert("Sign Out", "Do you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await removePushToken().catch(() => undefined);
          await authClient.signOut();
          await signOutOfGoogle();
        },
      },
    ]);
  };

  const handleDeleteAccount = () =>
    Alert.alert(
      "Delete Account",
      "This deletes your profile, workouts, routines, exercises, follows, kudos and notifications. You cannot undo this.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteAccount(undefined, {
              onSuccess: discardWorkout,
              onError: () =>
                Alert.alert(
                  "Could not delete account",
                  "Try again in a moment.",
                ),
            }),
        },
      ],
    );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="pb-safe-offset-6"
    >
      <View className="flex-row items-center gap-3.5 border-y border-border px-5 py-4">
        <Avatar alt={profile?.username ?? ""} className="size-[60px]">
          <AvatarImage source={{ uri: profile?.avatarUrl ?? undefined }} />
          <AvatarFallback />
          {isUpdatingAvatar && (
            <View className="absolute inset-0 items-center justify-center bg-black/40">
              <Spinner className="text-white" />
            </View>
          )}
        </Avatar>
        <View className="flex-1 gap-0.5">
          <Text className="text-lg font-semibold" numberOfLines={1}>
            {profile?.username}
          </Text>
          <Text
            className="font-mono text-xs text-muted-foreground"
            numberOfLines={1}
          >
            {session?.user.email}
          </Text>
        </View>
        <Button
          variant="strong"
          size="sm"
          disabled={isUpdatingAvatar}
          onPress={handleAvatarPress}
        >
          <Text>Edit Photo</Text>
        </Button>
      </View>

      <SectionTitle>PROFILE</SectionTitle>
      <SettingsRow
        label="Username"
        value={profile?.username}
        chevron
        onPress={() => router.push("/profile/edit-username")}
      />

      <SectionTitle>THEME</SectionTitle>
      <ThemePicker />

      <SectionTitle>DATA</SectionTitle>
      <SettingsRow
        label="Import from Strong"
        chevron
        trailing={isImporting ? <Spinner /> : undefined}
        onPress={isImporting ? undefined : importFile}
      />

      <SectionTitle>SUPPORT</SectionTitle>
      <SettingsRow
        label="Terms of Use"
        chevron
        onPress={() => router.push("/terms")}
      />

      <SectionTitle>ACCOUNT</SectionTitle>
      <SettingsRow label="Sign Out" onPress={handleSignOut} />
      <SettingsRow
        label="Delete Account"
        destructive
        trailing={isDeletingAccount ? <Spinner /> : undefined}
        onPress={isDeletingAccount ? undefined : handleDeleteAccount}
      />
    </ScrollView>
  );
}
