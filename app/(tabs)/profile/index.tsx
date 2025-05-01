import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@react-navigation/native";
import { mySync } from "@/db/sync";
import { useSync } from "@/providers/SyncProvider";
import database, { resetUserData } from "@/db";
import Button from "@/components/Button";
import { router, Stack } from "expo-router";
import LoginScreen from "@/app/(auth)/login";
import { supabase } from "@/lib/supabase";
import { BodyScrollView } from "@/components/BodyScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Image } from "expo-image";
import { ActionSheetIOS } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  useProfile,
  uploadImageAsync,
  getProfileImageUrl,
} from "@/api/profile";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/zeego/drop-down";

export default function ProfileScreen() {
  const { user } = useAuth();
  const { updateLastSync } = useSync();
  const { colors } = useTheme();
  const [imageVersion, setImageVersion] = useState(Date.now());

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
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      await uploadImageAsync(uri, user.id, setImageVersion);
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
      ]
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
      await mySync(user, updateLastSync, () => {});

      await logout();
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
        ]
      );
    }
  };

  const showImagePickerOptions = () => {
    ActionSheetIOS.showActionSheetWithOptions(
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
      }
    );
  };

  return (
    <BodyScrollView style={{ paddingHorizontal: 20 }}>
      <Stack.Screen
        options={{
          headerTitle: user.user_metadata.username || "Profile",
          headerRight: () => (
            <DropdownMenuRoot>
              <DropdownMenuTrigger>
                <TouchableOpacity>
                  <Ionicons
                    name="ellipsis-horizontal-sharp"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  key="settings"
                  onSelect={() => router.push("/(modals)/settings")}
                >
                  <DropdownMenuItemTitle>Settings</DropdownMenuItemTitle>
                  <DropdownMenuItemIcon ios={{ name: "gear" }} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  key="sync"
                  onSelect={() => mySync(user, updateLastSync, () => {})}
                >
                  <DropdownMenuItemTitle>Sync</DropdownMenuItemTitle>
                  <DropdownMenuItemIcon ios={{ name: "arrow.2.circlepath" }} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  destructive
                  key="logout"
                  onSelect={handleLogout}
                >
                  <DropdownMenuItemTitle>Logout</DropdownMenuItemTitle>
                  <DropdownMenuItemIcon ios={{ name: "arrow.left.square" }} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  destructive
                  key="delete-account"
                  onSelect={showDeleteAccountAlert}
                >
                  <DropdownMenuItemTitle>Delete account</DropdownMenuItemTitle>
                  <DropdownMenuItemIcon ios={{ name: "trash" }} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuRoot>
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
          source={{ uri: getProfileImageUrl(user.id, imageVersion) }}
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
