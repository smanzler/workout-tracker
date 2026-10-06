import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Text,
} from "react-native";
import { router, Stack } from "expo-router";
import { BodyScrollView } from "@/components/body-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "expo-router/react-navigation";
import { Image } from "expo-image";
import {
  getProfileImageUrl,
  useProfile,
} from "@/features/social/profile/lib/profile";
import {
  useLiveNotifications,
  useNotifications,
} from "../hooks/use-live-notifications";
import { useAuth } from "@/hooks/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { EmptyState } from "@/components/empty-state";

export type NotificationType = {
  id: string;
  type: "follow" | "follow_request" | "like";
  recipient_id: string;
  actor_id: string;
  created_at: string;
  post_id?: string;
  read_at: string | null;
};

const NotificationItem: React.FC<{
  notification: NotificationType;
  refetch: () => void;
}> = ({ notification, refetch }) => {
  const { colors } = useTheme();
  const { data: actor } = useProfile(notification.actor_id);

  const handleFollowRequest = async (type: "accept" | "reject") => {
    try {
      const { error } = await supabase.rpc(
        type === "accept" ? "accept_follow_request" : "reject_follow_request",
        {
          _follower_id: notification.actor_id,
        },
      );

      if (error) throw error;

      refetch();
    } catch (error) {
      console.error("Error handling follow request:", error);
    }
  };

  const renderNotificationContent = () => {
    switch (notification.type) {
      case "follow_request":
        return (
          <View style={styles.rowContainer}>
            <View style={styles.textContainer}>
              <Text numberOfLines={2}>
                <ThemedText type="defaultSemiBold" style={styles.username}>
                  {actor?.profile.username + " "}
                </ThemedText>
                <ThemedText style={styles.text}>
                  sent you a friend request
                </ThemedText>
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => handleFollowRequest("accept")}
              >
                <Ionicons name="checkmark" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: String(colors.text)
                      .replace("rgb", "rgba")
                      .replace(")", ", 0.2)"),
                  },
                ]}
                onPress={() => handleFollowRequest("reject")}
              >
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        );
      case "like":
        return (
          <View style={styles.textContainer}>
            <ThemedText
              type="defaultSemiBold"
              numberOfLines={1}
              style={styles.username}
            >
              {actor?.profile.username}
            </ThemedText>
            <ThemedText numberOfLines={1} style={styles.text}>
              liked your post
            </ThemedText>
          </View>
        );
      case "follow":
        return (
          <View style={styles.textContainer}>
            <ThemedText
              type="defaultSemiBold"
              numberOfLines={1}
              style={styles.username}
            >
              {actor?.profile.username}
            </ThemedText>
            <ThemedText numberOfLines={1} style={styles.text}>
              started following you
            </ThemedText>
          </View>
        );
      default:
        return null;
    }
  };

  const pushPage = () => {
    console.log("notification");
    console.log("pushing", notification.type);
    if (
      notification.type === "follow" ||
      notification.type === "follow_request"
    ) {
      console.log("pushing profile", notification.actor_id);
      router.push({
        pathname: "/(modals)/profile",
        params: {
          userId: notification.actor_id,
        },
      });
    } else if (notification.type === "like") {
      console.log("pushing post", notification.post_id);
      router.push({
        pathname: "/(modals)/post",
        params: {
          postId: notification.post_id,
        },
      });
    }
  };

  return (
    <TouchableOpacity
      style={[styles.notificationItem, { backgroundColor: colors.card }]}
      onPress={pushPage}
    >
      <Image
        source={{ uri: getProfileImageUrl(notification.actor_id) ?? undefined }}
        style={styles.avatar}
        cachePolicy="memory"
      />
      {renderNotificationContent()}
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const {
    data: notifications,
    isLoading,
    refetch,
  } = useNotifications(user?.id);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!notifications?.length) {
    return (
      <EmptyState
        icon="notifications-outline"
        title="No Notifications"
        description="When someone interacts with you, you'll see it here"
        isRefetching={isLoading}
        onRefresh={refetch}
      />
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NotificationItem notification={item} refetch={refetch} />
      )}
      refreshing={isLoading}
      onRefresh={refetch}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationItem: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 15,
  },
  rowContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  button: {
    borderRadius: 8,
    padding: 3,
  },
  username: {
    marginRight: 5,
    flexShrink: 1,
  },
  text: {
    flex: 1,
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
    opacity: 0.7,
  },
});
