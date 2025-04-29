import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { ThemedText } from "./ThemedText";
import { formatDuration } from "@/utils/format";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTheme } from "@react-navigation/native";
import { Entypo, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { getProfileImageUrl } from "@/api/profile";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import PagerView from "react-native-pager-view";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemTitle,
  DropdownMenuItemIcon,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/zeego/drop-down";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";
import PostWorkoutSummary from "./PostWorkoutSummary";

interface User {
  id: string;
  username: string;
  full_name: string;
}

interface Set {
  reps?: number;
  weight?: number;
  is_1rm_pr?: boolean;
  is_volume_pr?: boolean;
  is_weight_pr?: boolean;
}

interface WorkoutExercise {
  sets: Set[];
  exercise_id: string;
  exercise_title: string;
}

interface Workout {
  exercises: WorkoutExercise[];
  start_time: string;
  end_time: string;
  workout_id: string;
  workout_name: string;
}

interface Post {
  id: string;
  user: User;
  caption: string;
  image_url: string;
  created_at: string;
  like_count: number;
  liked_by_user: boolean;
  workout: Workout;
}

const PostListItem = ({ post }: { post: Post }) => {
  const { colors } = useTheme();
  const [liked, setLiked] = useState(post.liked_by_user);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [currentPage, setCurrentPage] = useState(0);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["following-posts"] });
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleReport = async () => {
    try {
      const { error } = await supabase.from("post_reports").insert({
        post_id: post.id,
        reporter_id: user?.id,
        status: "pending",
      });

      if (error) throw error;
      Alert.alert("Report", "Post reported successfully");
    } catch (error: any) {
      if (error.code === "23505") {
        Alert.alert("Report", "You have already reported this post");
      } else {
        Alert.alert("Report", "Failed to report post");
      }
    }
  };

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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/(modals)/profile",
              params: { userId: post.user.id },
            });
          }}
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
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
              source={{ uri: getProfileImageUrl(post.user.id) }}
              cachePolicy="memory-disk"
            />
          </View>

          <View style={{ flexDirection: "column", gap: 2 }}>
            <ThemedText type="defaultSemiBold">{post.user.username}</ThemedText>
            <Text style={{ color: colors.text, opacity: 0.7, fontSize: 12 }}>
              {dayjs(post.created_at).fromNow()}
            </Text>
          </View>
        </TouchableOpacity>

        <DropdownMenuRoot>
          <DropdownMenuTrigger>
            <Entypo
              name="dots-three-horizontal"
              size={18}
              color={colors.text}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {user?.id === post.user.id && (
              <DropdownMenuItem
                key="delete"
                onSelect={handleDelete}
                destructive
              >
                <DropdownMenuItemIcon ios={{ name: "trash" }} />
                <DropdownMenuItemTitle>Delete Post</DropdownMenuItemTitle>
              </DropdownMenuItem>
            )}
            {user?.id !== post.user.id && (
              <DropdownMenuItem
                key="report"
                onSelect={handleReport}
                destructive
              >
                <DropdownMenuItemIcon ios={{ name: "flag" }} />
                <DropdownMenuItemTitle>Report Post</DropdownMenuItemTitle>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </View>

      {(() => {
        const pages = [];
        if (post.image_url) {
          pages.push(
            <View
              key="image"
              style={{
                flex: 1,
                aspectRatio: 1,
              }}
            >
              <Image
                source={{ uri: post.image_url }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={300}
              />
            </View>
          );
        }

        if (post.workout.exercises.length > 0) {
          pages.push(
            <PostWorkoutSummary key="workout" workout={post.workout} />
          );
        }

        if (pages.length === 0) return null;

        return (
          <>
            <PagerView
              style={{
                width: "100%",
                aspectRatio: 1,
                gap: 15,
                marginBottom: 10,
                borderRadius: 10,
                overflow: "hidden",
              }}
              initialPage={0}
              onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
            >
              {pages}
            </PagerView>

            {pages.length > 1 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 4,
                  marginBottom: 10,
                  position: "absolute",
                  bottom: 20,
                  left: 0,
                  right: 0,
                }}
              >
                {pages.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: colors.text,
                      opacity: currentPage === index ? 1 : 0.6,
                    }}
                  />
                ))}
              </View>
            )}
          </>
        );
      })()}

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
