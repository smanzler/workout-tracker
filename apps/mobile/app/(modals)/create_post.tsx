import {
  Button as RNButton,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { router, Stack } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import { ThemedText } from "@/components/ThemedText";
import Divider from "@/components/Divider";
import { usePostActions, usePostWorkout } from "@/stores/postStore";
import { BodyScrollView } from "@/components/BodyScrollView";
import * as ImagePicker from "expo-image-picker";
import Button from "@/components/Button";
import { postPost } from "@/api/posts";
import { useAuth } from "@/providers/AuthProvider";
import { useWorkout } from "@/providers/WorkoutProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useActionSheet } from "@expo/react-native-action-sheet";

const CreatePost = () => {
  const { colors } = useTheme();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const workout = usePostWorkout();
  const { setWorkout } = usePostActions();
  const { user } = useAuth();
  const { showActionSheetWithOptions } = useActionSheet();

  const [status, requestPermission] = ImagePicker.useCameraPermissions();

  const queryClient = useQueryClient();

  const handlePickImage = async (type: "pick" | "take") => {
    if (type === "take") {
      console.log("status", status);
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
    }

    try {
      let result =
        type === "pick"
          ? await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0,
            })
          : await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0,
            });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error picking image:", (error as Error).message);
      console.log("Error picking image:", error);
    }
  };

  const handlePost = async () => {
    setLoading(true);
    if (!user) return;
    if (!workout) return;

    try {
      await postPost(caption, user, workout.id, image || undefined);

      await queryClient.invalidateQueries({ queryKey: ["following-posts"] });

      setWorkout(null);

      router.back();
    } catch (error) {
      console.log("Error posting:", error);
    }

    setLoading(false);
  };

  const showImagePickerOptions = () => {
    showActionSheetWithOptions(
      {
        options: ["Cancel", "Choose image from library", "Take a photo"],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          handlePickImage("pick");
        } else if (buttonIndex === 2) {
          handlePickImage("take");
        }
      },
    );
  };

  return (
    <BodyScrollView style={{ padding: 20 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <RNButton onPress={() => router.back()} title="Cancel" />
          ),
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: 20,
        }}
      >
        <ThemedText type="defaultSemiBold">Workout</ThemedText>

        <TouchableOpacity
          onPress={() => router.push("/(modals)/workout_picker")}
          style={{ flexDirection: "row", gap: 10 }}
        >
          {workout && <ThemedText>{workout.name || "New Workout"}</ThemedText>}
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Divider />

      <View style={{ flexDirection: "row", gap: 20, marginVertical: 20 }}>
        <ThemedText style={{ alignSelf: "baseline" }} type="defaultSemiBold">
          Caption
        </ThemedText>
        <TextInput
          placeholder="Write a caption here..."
          placeholderTextColor={colors.text}
          value={caption}
          onChangeText={setCaption}
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.text,
            opacity: 0.6,
          }}
        />
      </View>

      <Divider />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginVertical: 20,
        }}
      >
        <ThemedText type="defaultSemiBold">Image</ThemedText>
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.card,
              width: 200,
              aspectRatio: 1,
              borderRadius: 10,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={showImagePickerOptions}
          >
            {image ? (
              <Image
                style={{ width: 200, aspectRatio: 1 }}
                source={{ uri: image }}
              />
            ) : (
              <MaterialIcons
                name="question-mark"
                size={50}
                color={colors.text}
              />
            )}
          </TouchableOpacity>

          {image && (
            <RNButton title="Remove Image" onPress={() => setImage(null)} />
          )}
        </View>
      </View>

      <Button
        disabled={!caption || !workout}
        onPress={handlePost}
        loading={loading}
      >
        Post
      </Button>
    </BodyScrollView>
  );
};

export default CreatePost;

const styles = StyleSheet.create({});
