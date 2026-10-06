import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { usePost } from "@/api/posts";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import PostListItem from "@/components/PostListItem";
import { BodyScrollView } from "@/components/BodyScrollView";

const Post = () => {
  const { colors } = useTheme();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { data: post } = usePost(postId);

  console.log(post);

  return (
    <BodyScrollView style={{ padding: 20 }}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {post && <PostListItem post={post} />}
    </BodyScrollView>
  );
};

export default Post;

const styles = StyleSheet.create({});
