import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@react-navigation/native";
import { mySync } from "@/db/sync";
import { useSync } from "@/providers/SyncProvider";
import database from "@/db";
import Button from "@/components/Button";
import { Stack } from "expo-router";
import LoginScreen from "@/app/(auth)/login";
import { supabase } from "@/lib/supabase";
import { BodyScrollView } from "@/components/BodyScrollViiew";
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

export default function ProfileScreen() {
  const { user } = useAuth();
  const { updateLastSync } = useSync();
  const { colors } = useTheme();
  const [imageVersion, setImageVersion] = useState(Date.now());
  const { data: profile, refetch } = useProfile(user?.id);

  if (!user) return <LoginScreen />;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
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
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      await uploadImageAsync(uri, user.id, setImageVersion);
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
          headerTitle: profile?.username,
          headerRight: () => (
            <TouchableOpacity>
              <Ionicons
                name="ellipsis-horizontal-sharp"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
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
      <Button
        style={{ marginBottom: 10 }}
        onPress={() => mySync(user, updateLastSync, () => {})}
      >
        Sync
      </Button>
      <Button
        style={{}}
        onPress={() => supabase.auth.signOut()}
        variant="outline"
      >
        Log Out
      </Button>
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
