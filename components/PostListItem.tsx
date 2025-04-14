import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Image } from "react-native";
import { ThemedText } from "./ThemedText";
import { formatDuration } from "@/utils/format";
import dayjs from "dayjs";
import { useTheme } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

type Post = {
  id: string;
  user: { user_id: string; username: string; avatar_url: string };
  caption: string;
  image_url: null;
  created_at: Date;
  like_count: number;
  routine_or_workout: {
    exercises: { set_count: number; exercise_title: string }[];
    start_time: Date;
    workout_id: string;
    workout_name: string;
  };
};

const PostListItem = ({ post }: { post: Post }) => {
  const { colors } = useTheme();

  return (
    <View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View
          style={{
            width: 50,
            aspectRatio: 1,
            borderRadius: 25,
            marginBottom: 10,
            overflow: "hidden",
          }}
        >
          <Image
            style={{ backgroundColor: "pink", width: "100%", height: "100%" }}
          />
        </View>
        <View>
          <ThemedText type="defaultSemiBold">{post.user.username}</ThemedText>
          <ThemedText>
            {formatDuration(dayjs(post.created_at).unix(), dayjs().unix())}
          </ThemedText>
        </View>
      </View>

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
            overflow: "hidden",
            aspectRatio: 1,
          }}
        >
          <Image
            style={{ backgroundColor: "pink", width: "100%", height: "100%" }}
          />
        </View>

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
      </View>

      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <TouchableOpacity>
          <FontAwesome name="heart-o" color={colors.text} size={24} />
        </TouchableOpacity>
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
