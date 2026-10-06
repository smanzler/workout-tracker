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
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "expo-router/react-navigation";
import { useNetwork } from "@/providers/NetworkProvider";
import { mySync } from "@/db/sync";
import { useSync } from "@/providers/SyncProvider";
import database, { resetUserData } from "@/db";
import { router, Stack } from "expo-router";
import LoginScreen from "@/app/(auth)/login";
import { supabase } from "@/lib/supabase";
import { BodyScrollView } from "@/components/BodyScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { uploadImageAsync, getProfileImageUrl } from "@/api/profile";
import { useMenu } from "@/hooks/useMenu";
import { useWorkout } from "@/providers/WorkoutProvider";
import { removePushTokenFromServer } from "@/api/notifications";
import { importStrongCSV } from "@/utils/csvImport";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { EmptyState } from "@/components/EmptyState";

export default function ProfileScreen() {
  const { user, isLoading } = useAuth();
  const { updateLastSync } = useSync();
  const { colors } = useTheme();
  const { isOnline } = useNetwork();
  const [imageVersion, setImageVersion] = useState(() => Date.now());
  const { activeWorkoutId } = useWorkout();
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const [importing, setImporting] = useState(false);
  const { showActionSheetWithOptions } = useActionSheet();
  const showMenu = useMenu();

  if (isLoading) return <ActivityIndicator />;

  if (!isOnline) {
    return (
      <EmptyState
        icon="globe-outline"
        title="Offline"
        description="You're currently offline. Please check your internet connection and try again."
      />
    );
  }

  if (!user) return <LoginScreen />;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      await uploadImageAsync(uri, user.id, setImageVersion);
    }
  };

  const takePhoto = async () => {
    if (status?.status !== ImagePicker.PermissionStatus.GRANTED) {
      if (status?.canAskAgain === true) {
        const { status } = await requestPermission();
        if (status !== ImagePicker.PermissionStatus.GRANTED) {
          Alert.alert("Permission not granted");
          return;
        }
      } else {
        Alert.alert(
          "Alert",
          "Permission not granted, please go to settings and grant permission",
          [
            {
              text: "Go to Settings",
              onPress: () => {
                Linking.openSettings();
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ],
        );
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        await uploadImageAsync(uri, user.id, setImageVersion);
      }
    } catch (error) {
      Alert.alert("Error taking photo:", (error as Error).message);
    }
  };

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

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc("delete_user");

      if (error) throw error;

      await logout();
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();

      await resetUserData();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const handleLogout = async () => {
    try {
      if (activeWorkoutId) {
        Alert.alert(
          "Active workout",
          "You have an active workout. Please finish it before logging out.",
        );
        return;
      }

      if (!isOnline) {
        Alert.alert(
          "Offline",
          "You're currently offline. If you logout now, your latest changes might not be synced.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Logout Anyway",
              onPress: async () => {
                try {
                  await logout();
                } catch (error) {
                  console.error("Failed to logout:", error);
                }
              },
              style: "destructive",
            },
          ],
        );
        return;
      }

      await removePushTokenFromServer(user.id);

      try {
        await mySync(user, updateLastSync, () => {});
      } catch (error) {
        console.error("Failed to logout:", error);
        Alert.alert(
          "Error",
          "Failed to sync data. If you still want to logout, you could lose data.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Logout",
              onPress: async () => {
                try {
                  await logout();
                } catch (error) {
                  console.error("Failed to logout:", error);
                }
              },
              style: "destructive",
            },
          ],
        );
        throw error;
      }

      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const showImagePickerOptions = () => {
    showActionSheetWithOptions(
      {
        options: ["Cancel", "Choose image from library", "Take a photo"],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          pickImage();
        } else if (buttonIndex === 2) {
          takePhoto();
        }
      },
    );
  };

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
          headerTitle: user.user_metadata.username || "Profile",
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
                      label: "Sync",
                      onSelect: () => {
                        if (!isOnline) {
                          Alert.alert(
                            "Offline",
                            "You need to be online to sync your data.",
                          );
                          return;
                        }
                        mySync(user, updateLastSync, () => {});
                      },
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
          source={{
            uri: getProfileImageUrl(user.id, imageVersion) ?? undefined,
          }}
        />

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
