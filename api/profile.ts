import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";

export interface ProfileDetails {
  posts: Post[];
  profile: Profile;
}

interface Profile {
  bio: string;
  follow_requested: boolean;
  follower_count: number;
  id: string;
  is_following: boolean;
  is_public: boolean;
  username: string;
}

interface Post {
  id: string;
  preview: string;
}

export const uploadImageAsync = async (
  uri: string,
  userId: string,
  setImageVersion: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });

    const filePath = `${userId}.png`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, decode(base64), {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Upload failed:", error.message);
      return null;
    }

    setImageVersion(Date.now());
  } catch (error) {
    console.error("Error uploading image:", error);
  }
};

export const useProfile = (userId: string | undefined) => {
  return useQuery<ProfileDetails>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const { data, error } = await supabase.rpc("get_profile_details", {
        target_user_id: userId,
      });

      if (error) {
        console.error("Failed to fetch profile:", error.message);
        throw error;
      }

      return data;
    },
    enabled: !!userId,
  });
};

export const getProfileImageUrl = (userId: string, version: number) => {
  if (!userId) return null;
  const filePath = `${userId}.png`;
  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  return `${data.publicUrl}?v=${version}`;
};
