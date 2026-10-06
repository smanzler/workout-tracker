import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { ThemedText } from "./ThemedText";
import { formatDuration } from "@/utils/format";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTheme } from "expo-router/react-navigation";
import { Entypo, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { getProfileImageUrl } from "@/api/profile";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { Carousel, Pagination } from "react-native-reanimated-carousel";
import { useMenu } from "@/hooks/useMenu";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { PostgrestError } from "@supabase/supabase-js";
import PostWorkoutSummary from "./PostWorkoutSummary";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  withSpring,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  runOnJS,
} from "react-native-reanimated";

dayjs.extend(relativeTime);

const { width } = Dimensions.get("window");

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const showMenu = useMenu();
  const [isLoading, setIsLoading] = useState(false);
  const scale = useSharedValue(0);

  const progress = useSharedValue<number>(0);

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
    setIsLoading(true);
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount((prev) => prev + (newLikedState ? 1 : -1));

    const { error } = await supabase.rpc(
      newLikedState ? "like_post" : "unlike_post",
      {
        _post_id: post.id,
      },
    );

    if (error) {
      setLiked(!newLikedState);
      setLikeCount((prev) => prev - (newLikedState ? 1 : -1));
      console.error("Failed to toggle like:", error.message);
    }
    setIsLoading(false);
  };

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onStart(() => {
      if (!liked && !isLoading) {
        scale.value = withSpring(
          1,
          {
            mass: 1,
            damping: 15,
            stiffness: 200,
          },
          (finished) => {
            if (finished) {
              scale.value = withTiming(0, { duration: 150 });
            }
          },
        );
        runOnJS(toggleLike)();
      }
    });

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const renderContent = () => {
    const pages = [];
    if (post.image_url) {
      pages.push(
        <View
          key="image"
          style={{
            flex: 1,
            aspectRatio: 1,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: post.image_url }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
          />
        </View>,
      );
    }

    if (post.workout.exercises.length > 0) {
      pages.push(
        <PostWorkoutSummary
          key="workout"
          workout={post.workout}
          style={{ borderRadius: 20 }}
        />,
      );
    }

    if (pages.length === 0) return null;

    return (
      <GestureDetector gesture={doubleTap}>
        <View style={{ position: "relative" }}>
          <Carousel
            loop={false}
            data={pages}
            progress={progress}
            renderItem={({ item }) => item}
            style={{
              width: width - 40,
              height: width - 40,
              marginBottom: 10,
              borderRadius: 20,
            }}
            onConfigurePanGesture={(g) => {
              g.activeOffsetY([-999999, 999999]);
              g.activeOffsetX([-20, 20]);
            }}
          />

          {pages.length > 1 && (
            <View
              style={{
                position: "absolute",
                bottom: 20,
                left: 0,
                right: 0,
                alignItems: "center",
              }}
            >
              <Pagination
                count={pages.length}
                progress={progress}
                dotStyle={{
                  backgroundColor: colors.border,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                }}
                activeDotStyle={{
                  backgroundColor: colors.text,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                }}
                containerStyle={{
                  gap: 5,
                }}
              />
            </View>
          )}

          <Animated.View
            style={[
              {
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
              },
              heartAnimatedStyle,
            ]}
          >
            <FontAwesome
              name="heart"
              size={80}
              color="white"
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    );
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
              source={{ uri: getProfileImageUrl(post.user.id) ?? undefined }}
              cachePolicy="memory"
            />
          </View>

          <View style={{ flexDirection: "column", gap: 2 }}>
            <ThemedText type="defaultSemiBold">{post.user.username}</ThemedText>
            <Text style={{ color: colors.text, opacity: 0.7, fontSize: 12 }}>
              {dayjs(post.created_at).fromNow()}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            showMenu([
              user?.id === post.user.id
                ? {
                    label: "Delete Post",
                    onSelect: handleDelete,
                    destructive: true,
                  }
                : {
                    label: "Report Post",
                    onSelect: handleReport,
                    destructive: true,
                  },
            ])
          }
        >
          <Entypo name="dots-three-horizontal" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {renderContent()}

      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity onPress={toggleLike} disabled={isLoading}>
            <FontAwesome
              name={liked ? "heart" : "heart-o"}
              color={colors.text}
              size={24}
              style={{ opacity: isLoading ? 0.5 : 1 }}
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
