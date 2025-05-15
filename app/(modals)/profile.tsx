import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  followUser,
  getProfileImageUrl,
  unfollowUser,
  useProfile,
} from "@/api/profile";
import { BodyScrollView } from "@/components/BodyScrollView";
import { Image } from "expo-image";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/Button";
import { chunkArray } from "@/utils/format";
import { useAuth } from "@/providers/AuthProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Profile = () => {
  const { colors } = useTheme();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { data: profile, isLoading } = useProfile(userId);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async () => {
      if (profile?.profile.is_following || profile?.profile.follow_requested) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  const getFollowButtonText = () => {
    if (profile?.profile.is_following) return "Following";
    if (profile?.profile.follow_requested) return "Requested";
    return "Follow";
  };

  const getFollowButtonVariant = () => {
    if (profile?.profile.is_following || profile?.profile.follow_requested) {
      return "outline";
    }
    return "filled";
  };

  const isPrivateAndNotFollowing =
    profile?.profile.is_public === false && !profile?.profile.is_following;

  const chunkedPosts = chunkArray(profile?.posts || [], 3);
  const isOwnProfile = user?.id === userId;

  return (
    <BodyScrollView>
      <Stack.Screen
        options={{
          headerTitle: profile?.profile.username,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.profileHeader}>
        <Image
          style={[styles.profileImage, { backgroundColor: colors.card }]}
          source={{ uri: getProfileImageUrl(userId) }}
          cachePolicy="memory"
        />

        <View style={styles.bioSection}>
          <View style={styles.followersContainer}>
            <ThemedText type="subtitle">
              {profile?.profile.follower_count}
            </ThemedText>
            <ThemedText type="small" style={{ opacity: 0.8 }}>
              Followers
            </ThemedText>
          </View>

          <View style={styles.bioContainer}>
            <View style={styles.usernameContainer}>
              <ThemedText type="subtitle" style={styles.username}>
                {profile?.profile.username}
              </ThemedText>
              {profile?.profile.is_public === false && (
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color={colors.text}
                  style={styles.lockIcon}
                />
              )}
            </View>

            <ThemedText style={styles.bio}>
              {profile?.profile.bio || "No bio yet"}
            </ThemedText>
          </View>

          {!isOwnProfile && (
            <Button
              onPress={() => followMutation.mutate()}
              loading={followMutation.isPending}
              variant={getFollowButtonVariant()}
              style={{ width: "100%" }}
            >
              {getFollowButtonText()}
            </Button>
          )}
        </View>
      </View>

      <View style={styles.postsSection}>
        <ThemedText type="subtitle" style={styles.postsHeader}>
          Posts
        </ThemedText>

        <View style={[styles.postsGrid, { borderTopColor: colors.border }]}>
          {isPrivateAndNotFollowing ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="lock-closed"
                size={24}
                color={colors.text}
                style={styles.privateLockIcon}
              />
              <ThemedText type="subtitle">This Account is Private</ThemedText>
              <ThemedText style={styles.privateText}>
                Follow this account to see their posts
              </ThemedText>
            </View>
          ) : profile?.posts.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText type="subtitle">No Posts Yet</ThemedText>
            </View>
          ) : (
            chunkedPosts.map((row, index) => {
              const placeholdersNeeded = 3 - row.length;

              return (
                <View key={index} style={styles.row}>
                  {row.map((post) => (
                    <TouchableOpacity
                      key={post.id}
                      style={[
                        styles.postItem,
                        { backgroundColor: colors.card },
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/(modals)/post",
                          params: { postId: post.id },
                        })
                      }
                    >
                      {post.preview?.startsWith("http") ? (
                        <Image
                          source={{ uri: post.preview }}
                          style={styles.postImage}
                          contentFit="cover"
                        />
                      ) : (
                        <ThemedText
                          type="subtitle"
                          style={styles.postCaption}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {post.preview}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  ))}

                  {Array.from({ length: placeholdersNeeded }).map((_, i) => (
                    <View key={`placeholder-${i}`} style={styles.placeholder} />
                  ))}
                </View>
              );
            })
          )}
        </View>
      </View>
    </BodyScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  profileHeader: {
    padding: 20,
    alignItems: "center",
    gap: 20,
  },
  profileImage: {
    width: 120,
    aspectRatio: 1,
    borderRadius: 60,
  },
  bioSection: {
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  followersContainer: {
    alignItems: "center",
    gap: 2,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  username: {
    fontSize: 18,
  },
  lockIcon: {
    opacity: 0.8,
  },
  bio: {
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 8,
  },
  bioContainer: {
    alignItems: "center",
    gap: 2,
  },
  postsSection: {
    flex: 1,
  },
  postsHeader: {
    marginLeft: 20,
    marginBottom: 12,
  },
  postsGrid: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 12,
  },
  postItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  postCaption: {
    padding: 8,
    opacity: 0.8,
  },
  placeholder: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
  },
  emptyState: {
    paddingTop: 40,
    alignItems: "center",
    gap: 8,
  },
  privateLockIcon: {
    marginBottom: 8,
  },
  privateText: {
    opacity: 0.6,
    textAlign: "center",
  },
});
