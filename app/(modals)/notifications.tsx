import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router, Stack } from "expo-router";
import { BodyScrollView } from "@/components/BodyScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@react-navigation/native";
import { Image } from "expo-image";
import { getProfileImageUrl, useProfile } from "@/api/profile";
import {
  useLiveNotifications,
  useNotifications,
} from "@/hooks/useLiveNotifications";
import { useAuth } from "@/providers/AuthProvider";

type NotificationType = {
  id: string;
  type: "follow" | "follow_request" | "like";
  recipient_id: string;
  actor_id: string;
  created_at: string;
  postId?: string;
  read_at: string | null;
};

const NotificationItem: React.FC<{ notification: NotificationType }> = ({
  notification,
}) => {
  const { colors } = useTheme();
  const { data: actor } = useProfile(notification.actor_id);

  const renderNotificationContent = () => {
    switch (notification.type) {
      case "follow_request":
        return (
          <>
            <ThemedText type="defaultSemiBold" style={styles.username}>
              {actor?.profile.username}
            </ThemedText>
            <ThemedText>sent you a friend request</ThemedText>
          </>
        );
      case "like":
        return (
          <>
            <ThemedText type="defaultSemiBold" style={styles.username}>
              {actor?.profile.username}
            </ThemedText>
            <ThemedText>liked your post </ThemedText>
          </>
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
      console.log("pushing post", notification.postId);
      router.push({
        pathname: "/(modals)/post",
        params: {
          postId: notification.postId,
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
        source={{ uri: getProfileImageUrl(notification.actor_id) }}
        style={styles.avatar}
      />
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>{renderNotificationContent()}</View>
        <ThemedText style={styles.timestamp}>
          {new Date(notification.created_at).toLocaleString()}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useNotifications(user?.id);

  return isLoading ? (
    <ActivityIndicator />
  ) : (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NotificationItem notification={item} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
  },
  textContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  username: {
    marginRight: 5,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
    opacity: 0.7,
  },
});
