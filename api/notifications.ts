import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PushTokenUploadResponse {
  success: boolean;
  error?: string;
}

export async function uploadPushToken(
  token: string,
  userId: string
): Promise<PushTokenUploadResponse> {
  try {
    const { error } = await supabase.from("user_push_tokens").insert({
      user_id: userId,
      token,
    });

    if (error) {
      if (error.code !== "23505") {
        throw error;
      } else {
        console.log("Push token already exists");
        await AsyncStorage.setItem("tokenUploaded", "true");
        return { success: false, error: "Push token already exists" };
      }
    }

    await AsyncStorage.setItem("tokenUploaded", "true");

    return { success: true };
  } catch (error: any) {
    console.error("Error uploading push token:", error);
    return { success: false, error: error.message };
  }
}

export async function removePushTokenFromServer(userId: string) {
  console.log("Removing push token from server", userId);

  try {
    const { error } = await supabase.rpc("delete_user_push_token");

    if (error) {
      throw error;
    }

    await AsyncStorage.removeItem("tokenUploaded");
  } catch (error) {
    console.error("Error removing push token:", error);
    throw error;
  }
}
