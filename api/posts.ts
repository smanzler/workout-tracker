import { mySync } from "@/db/sync";
import { supabase } from "@/lib/supabase";
import { Routine } from "@/models/Routine";
import { Workout } from "@/models/Workout";
import { useSync } from "@/providers/SyncProvider";
import { User } from "@supabase/supabase-js";
import { useInfiniteQuery } from "@tanstack/react-query";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";

const fetchExplorePosts = async ({ pageParam = 0 }) => {
  const { data, error } = await supabase.rpc("get_explore_posts", {
    p_offset: pageParam,
    p_limit: 20,
    p_sort_by: "created_at",
    p_sort_order: "desc",
    p_filter: null,
  });

  if (error) throw error;
  return data;
};

export const useExplorePosts = () => {
  return useInfiniteQuery({
    queryKey: ["explore-posts"],
    queryFn: fetchExplorePosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < 20 ? undefined : allPages.length * 20;
    },
  });
};

export const postPost = async (
  caption: string,
  user?: User,
  workout?: Workout,
  routine?: Routine,
  image?: string
) => {
  if (!user) return;

  try {
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

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        workout_id: workout?.id,
        caption,
        image_url: filePath,
        is_public: true,
      });

      if (error) throw error;
    }
  } catch (error) {
    console.log(error);
  }
};
