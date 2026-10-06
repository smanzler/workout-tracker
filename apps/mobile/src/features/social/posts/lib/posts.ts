import { mySync } from "@/db/sync";
import { supabase } from "@/lib/supabase";
import { Workout } from "@/db/models/workout";
import { useSync } from "@/providers/sync-provider";
import { User } from "@supabase/supabase-js";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

const fetchExplorePosts = async ({ pageParam = 0 }) => {
  console.log("fetching explore posts", pageParam);
  const { data, error } = await supabase.rpc("get_explore_posts", {
    p_offset: pageParam,
    p_limit: 20,
    p_sort_by: "created_at",
    p_sort_order: "desc",
    p_filter: null,
  });

  if (error) throw error;
  console.log("explore posts", data);
  return data;
};

export const useExplorePosts = (enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["explore-posts"],
    queryFn: fetchExplorePosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < 20 ? undefined : allPages.length * 20;
    },
    enabled,
  });
};

export const fetchFollowingPosts = async ({ pageParam = 0 }) => {
  console.log("fetching following posts", pageParam);
  const { data, error } = await supabase.rpc("get_following_posts", {
    p_offset: pageParam,
    p_limit: 20,
    p_sort_by: "created_at",
    p_sort_order: "desc",
  });

  if (error) throw error;
  console.log("following posts", data);
  return data;
};

export const useFollowingPosts = (enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["following-posts"],
    queryFn: fetchFollowingPosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < 20 ? undefined : allPages.length * 20;
    },
    enabled,
  });
};

export const postPost = async (
  caption: string,
  user: User,
  workout_id: string,
  image?: string,
) => {
  if (!user) return;

  try {
    let publicUrl = null;

    if (image) {
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: "base64",
      });
      const filePath = `${user.id}/${new Date().getTime()}.png`;
      const { error: storageError } = await supabase.storage
        .from("post-images")
        .upload(filePath, decode(base64), {
          contentType: "image/png",
        });

      if (storageError) throw storageError;

      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      publicUrl = data.publicUrl;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      user_id: user.id,
      workout_id,
      caption,
      image_url: publicUrl,
    });

    if (insertError) throw insertError;
  } catch (error) {
    Alert.alert("Error", "Failed to post. Please try again.");
    throw error;
  }
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_post_by_id", {
        _post_id: postId,
      });

      if (error) throw error;

      return data;
    },
  });
};
