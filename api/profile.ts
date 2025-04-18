import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";

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
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, bio")
        .eq("id", userId)
        .single();

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
