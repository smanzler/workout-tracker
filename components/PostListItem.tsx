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
import PagerView from "react-native-pager-view";

interface Post {
  id: string;
  user: User;
  caption: string;
  image_url: string;
  created_at: string;
  like_count: number;
  liked_by_user: boolean;
  routine_or_workout: Routine | Workout;
}

interface Routine {
  exercises: RoutineExercise[];
  start_time: string;
  routine_id: string;
  routine_name: string;
}

interface Workout {
  exercises: WorkoutExercise[];
  start_time: string;
  workout_id: string;
  workout_name: string;
}

interface RoutineExercise {
  sets: RoutineSet[];
  exercise_id: string;
  exercise_title: string;
}

interface WorkoutExercise {
  sets: Set[];
  exericse_id: string;
  exercise_title: string;
}

interface RoutineSet {
  reps?: number;
  weight?: number;
}

interface Set {
  reps?: number;
  weight?: number;
  is_1rm_pr?: boolean;
  is_volume_pr?: boolean;
  is_weight_pr?: boolean;
}

interface User {
  user_id: string;
  username: string;
}

const PostListItem = ({ post }: { post: Post }) => {
  const { colors } = useTheme();
  const [liked, setLiked] = useState(post.liked_by_user);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [currentPage, setCurrentPage] = useState(0);

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
            cachePolicy="memory-disk"
          />
        </View>
        <ThemedText type="defaultSemiBold">{post.user.username}</ThemedText>
      </TouchableOpacity>

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

        if (post.routine_or_workout.exercises.length > 0) {
          pages.push(
            <View
              key="workout"
              style={{
                flex: 1,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ padding: 12 }}>
                <ThemedText style={{ marginBottom: 4 }} type="subtitle">
                  {("workout_id" in post.routine_or_workout
                    ? post.routine_or_workout.workout_name
                    : post.routine_or_workout.routine_name) || "Workout"}
                </ThemedText>
                {post.routine_or_workout.exercises.map((e, i) => (
                  <ThemedText numberOfLines={1} key={i}>
                    {e.exercise_title}
                  </ThemedText>
                ))}
              </View>
            </View>
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
                      backgroundColor:
                        currentPage === index
                          ? colors.text
                          : colors.text + "50",
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
