import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { ThemedText } from "./ThemedText";
import { formatDuration } from "@/utils/format";
import dayjs from "dayjs";
import { useTheme } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { getProfileImageUrl } from "@/api/profile";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

type Post = {
  id: string;
  user: { user_id: string; username: string; avatar_url: string };
  caption: string;
  image_url: null;
  created_at: Date;
  like_count: number;
  liked_by_user: boolean;
  routine_or_workout: {
    exercises: { set_count: number; exercise_title: string }[];
    start_time: Date;
    workout_id: string;
    workout_name: string;
  };
};

const PostListItem = ({ post }: { post: Post }) => {
  const { colors } = useTheme();
  const [liked, setLiked] = useState(post.liked_by_user);
  const [likeCount, setLikeCount] = useState(post.like_count);

  const toggleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount((prev) => prev + (newLikedState ? 1 : -1));

    const { error } = await supabase.rpc(
      newLikedState ? "like_post" : "unlike_post",
      {
        _post_id: post.id,
      }
    );

    if (error) {
      setLiked(!newLikedState);
      setLikeCount((prev) => prev - (newLikedState ? 1 : -1));
      console.error("Failed to toggle like:", error.message);
    }
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(modals)/profile",
            params: { userId: post.user.user_id },
          });
        }}
        style={{
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <View
          style={{
            width: 50,
            aspectRatio: 1,
            borderRadius: 25,
            overflow: "hidden",
          }}
        >
          <Image
            style={{
              backgroundColor: colors.card,
              width: "100%",
              height: "100%",
            }}
            source={{ uri: getProfileImageUrl(post.user.user_id) }}
          />
        </View>
        <ThemedText type="defaultSemiBold">{post.user.username}</ThemedText>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 15,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: 10,
            backgroundColor: colors.card,
          }}
        >
          <View style={{ padding: 12 }}>
            <ThemedText style={{ marginBottom: 4 }} type="subtitle">
              {post.routine_or_workout.workout_name || "Workout"}
            </ThemedText>
            {post.routine_or_workout.exercises.map((e, i) => (
              <ThemedText numberOfLines={1} key={i}>
                {e.exercise_title}
              </ThemedText>
            ))}
          </View>
        </View>

        <View
          style={{
            flex: 1,
            borderRadius: 10,
            overflow: "hidden",
            aspectRatio: 1,
          }}
        >
          <Image
            source={post.image_url}
            style={{ width: 200, height: 200, borderRadius: 10 }}
            contentFit="cover"
            transition={300}
          />
        </View>
      </View>

      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity onPress={toggleLike}>
            <FontAwesome
              name={liked ? "heart" : "heart-o"}
              color={colors.text}
              size={24}
            />
          </TouchableOpacity>

          <ThemedText type="defaultSemiBold">{likeCount}</ThemedText>
        </View>
      </View>

      <View>
        <ThemedText type="default">
          <Text style={{ fontWeight: "600" }}>{post.user.username}</Text>
          <Text> {post.caption}</Text>
        </ThemedText>
      </View>
    </View>
  );
};

export default PostListItem;

const styles = StyleSheet.create({});
