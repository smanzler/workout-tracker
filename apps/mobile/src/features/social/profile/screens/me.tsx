import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Button,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "expo-router/react-navigation";
import { useNetwork } from "@/providers/network-provider";
import database, { resetUserData } from "@/db";
import { router, Stack } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { pickImage, takePhoto } from "@/lib/image";
import { BodyScrollView } from "@/components/body-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { Image } from "expo-image";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useMyProfile } from "../hooks/use-my-profile";
import { useUpdateProfile } from "../hooks/use-update-profile";
import { useDeleteAccount } from "../hooks/use-delete-account";
import { useMenu } from "@/hooks/use-menu";
import {
  useIsWorkingOut,
  useWorkoutSessionStore,
} from "@/features/activity/workouts/stores/workout-session-store";
import { importStrongCSV } from "@/features/activity/workouts/lib/csv-import";

export default function ProfileScreen() {
  const { user, isLoading } = useAuth();
  const { data: profile } = useMyProfile();
  const { mutate: updateAvatar, isPending: isUpdatingAvatar } =
    useUpdateProfile();
  const { mutate: deleteAccount } = useDeleteAccount();
  const { colors } = useTheme();
  const isWorkingOut = useIsWorkingOut();
  const discardWorkout = useWorkoutSessionStore((state) => state.discard);
  const [importing, setImporting] = useState(false);
  const showMenu = useMenu();

  if (isLoading) return <ActivityIndicator />;

  if (!user) return null;

  const handleUpdateAvatar = (avatar: string | null) =>
    updateAvatar(
      { avatar },
      {
        onError: (error) => Alert.alert("Error", error.message),
      },
    );

  const showDeleteAccountAlert = () => {
    Alert.alert(
      "Delete account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleDeleteAccount,
        },
      ],
    );
  };

  const handleDeleteAccount = () =>
    deleteAccount(undefined, {
      onSuccess: () => {
        discardWorkout();
        resetUserData();
      },
      onError: (error) => Alert.alert("Error", error.message),
    });

  const handleLogout = async () => {
    if (isWorkingOut) {
      Alert.alert(
        "Active workout",
        "You have an active workout. Please finish it before logging out.",
      );
      return;
    }

    try {
      await authClient.signOut();
      await resetUserData();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const showImagePickerOptions = () =>
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
              onSelect: () => handleUpdateAvatar(null),
              destructive: true,
            },
          ]
        : []),
    ]);

  const handleImportCSV = async () => {
    try {
      setImporting(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const response = await fetch(result.assets[0].uri);
        const csvContent = await response.text();
        await importStrongCSV(database, csvContent, user.id);
        Alert.alert("Success", "Workout data imported successfully");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "An error occurred during import",
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <BodyScrollView style={{ padding: 20 }}>
      <Stack.Screen
        options={{
          headerTitle: profile?.username ?? "Profile",
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => router.push("/(modals)/notifications")}
              >
                <Ionicons
                  name="notifications"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  showMenu([
                    {
                      label: "Settings",
                      onSelect: () => router.push("/(modals)/settings"),
                    },
                    {
                      label: importing ? "Importing..." : "Import Strong CSV",
                      onSelect: handleImportCSV,
                      disabled: importing,
                    },
                    {
                      label: "Logout",
                      onSelect: handleLogout,
                      destructive: true,
                    },
                    {
                      label: "Delete account",
                      onSelect: showDeleteAccountAlert,
                      destructive: true,
                    },
                  ])
                }
              >
                <Ionicons
                  name="ellipsis-horizontal-sharp"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={{ margin: "auto" }}>
        <Image
          style={{
            backgroundColor: colors.card,
            width: 150,
            aspectRatio: 1,
            borderRadius: 75,
            marginBottom: 20,
          }}
          source={{ uri: profile?.avatarUrl ?? undefined }}
        />

        {isUpdatingAvatar && (
          <ActivityIndicator
            style={{ position: "absolute", top: 65, left: 65 }}
          />
        )}

        <TouchableOpacity
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            padding: 5,
            borderRadius: 50,
            backgroundColor: colors.card,
          }}
          onPress={showImagePickerOptions}
        >
          <Ionicons name="pencil" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ThemedText type="defaultSemiBold" style={styles.user}>
        Logged in as {user.email}
      </ThemedText>
    </BodyScrollView>
  );
}

const styles = StyleSheet.create({
  user: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 30,
  },
});
