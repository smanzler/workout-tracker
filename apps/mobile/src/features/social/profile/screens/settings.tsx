import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BodyScrollView } from "@/components/ui/body-scroll-view";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { useStrongImport } from "@/features/activity/workouts/hooks/use-strong-import";
import { useRemovePushToken } from "@/features/notifications/hooks/use-remove-push-token";
import {
  useIsWorkingOut,
  useWorkoutSessionStore,
} from "@/features/activity/workouts/stores/workout-session-store";
import { useMenu } from "@/hooks/use-menu";
import { authClient } from "@/lib/auth-client";
import { pickImage, takePhoto } from "@/lib/image";
import { router } from "expo-router";
import {
  FileUp,
  LogOut,
  Mail,
  Moon,
  ReceiptText,
  Trash2,
} from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { Alert, View } from "react-native";
import { useUniwind } from "uniwind";
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionItem,
  SectionItemContent,
  SectionItemTitle,
  SectionTitle,
} from "../components/section";
import { useDeleteAccount } from "../hooks/use-delete-account";
import { useMyProfile } from "../hooks/use-my-profile";
import { useUpdateProfile } from "../hooks/use-update-profile";

export default function Settings() {
  const { theme, hasAdaptiveThemes } = useUniwind();
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
    <BodyScrollView>
      <View className="gap-8">
        <Pressable
          onPress={handleAvatarPress}
          disabled={isUpdatingAvatar}
          accessibilityLabel="Change photo"
        >
          <Avatar alt={profile?.username ?? ""} className="size-32">
            <AvatarImage source={{ uri: profile?.avatarUrl ?? undefined }} />
            <AvatarFallback />
            {isUpdatingAvatar && (
              <View className="absolute inset-0 items-center justify-center bg-black/40">
                <Spinner className="text-white" />
              </View>
            )}
          </Avatar>
        </Pressable>

        <Section>
          <SectionHeader>
            <SectionTitle>Profile</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <SectionItem onPress={() => router.push("/profile/edit-username")}>
              <SectionItemTitle>Username</SectionItemTitle>
              <SectionItemContent>{profile?.username}</SectionItemContent>
            </SectionItem>
          </SectionContent>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Appearance</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <SectionItem onPress={() => router.push("/theme")}>
              <Icon as={Moon} />
              <SectionItemTitle>Theme</SectionItemTitle>
              <SectionItemContent textClassName="capitalize">
                {hasAdaptiveThemes ? "system" : theme}
              </SectionItemContent>
            </SectionItem>
          </SectionContent>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Data</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <SectionItem onPress={isImporting ? undefined : importFile}>
              <Icon as={FileUp} />
              <SectionItemTitle>Import from Strong</SectionItemTitle>
              <SectionItemContent>
                {isImporting ? <Spinner /> : undefined}
              </SectionItemContent>
            </SectionItem>
          </SectionContent>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Support</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <SectionItem onPress={() => router.push("/terms")}>
              <Icon as={ReceiptText} />
              <SectionItemTitle>Terms of Use</SectionItemTitle>
              <SectionItemContent />
            </SectionItem>
          </SectionContent>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Account</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <SectionItem>
              <Icon as={Mail} />
              <SectionItemTitle>Email</SectionItemTitle>
              <SectionItemContent>{session?.user.email}</SectionItemContent>
            </SectionItem>
            <SectionItem onPress={handleSignOut}>
              <Icon as={LogOut} />
              <SectionItemTitle>Sign Out</SectionItemTitle>
            </SectionItem>
            <SectionItem
              onPress={isDeletingAccount ? undefined : handleDeleteAccount}
            >
              <Icon as={Trash2} className="text-destructive" />
              <SectionItemTitle className="text-destructive">
                Delete Account
              </SectionItemTitle>
              {isDeletingAccount && (
                <SectionItemContent>
                  <Spinner />
                </SectionItemContent>
              )}
            </SectionItem>
          </SectionContent>
        </Section>
      </View>
    </BodyScrollView>
  );
}
