import {
  Button as RNButton,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { router, Stack } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import Divider from "@/components/Divider";
import { usePostWorkout } from "@/stores/postStore";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import * as ImagePicker from "expo-image-picker";
import Button from "@/components/Button";
import { postPost } from "@/api/posts";
import { useAuth } from "@/providers/AuthProvider";
import { useWorkout } from "@/providers/WorkoutProvider";

const CreatePost = () => {
  const { colors } = useTheme();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const workout = usePostWorkout();
  const { user } = useAuth();

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    setLoading(true);

    await postPost(
      caption,
      user || undefined,
      workout || undefined,
      undefined,
      image || undefined
    );

    router.back();

    setLoading(false);
  };

  return (
    <BodyScrollView style={{ paddingHorizontal: 20 }}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => <RNButton onPress={() => {}} title="Cancel" />,
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
        <ThemedText type="defaultSemiBold">Workout or Routine</ThemedText>

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
          onChangeText={(text) => setCaption(text)}
          style={{
            fontSize: 16,
            color: colors.text,
            opacity: 0.6,
          }}
          numberOfLines={1}
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
            onPress={handlePickImage}
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

      <Button disabled={!caption} onPress={handlePost} loading={loading}>
        Post
      </Button>
    </BodyScrollView>
  );
};

export default CreatePost;

const styles = StyleSheet.create({});
