import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { BodyScrollView } from "@/components/body-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "expo-router/react-navigation";
import { router, Stack } from "expo-router";
import { useDebounce } from "@/hooks/use-debounce";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { getProfileImageUrl } from "../lib/profile";
import { Ionicons } from "@expo/vector-icons";

async function searchUsers(query: string) {
  if (!query) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, follower_count")
    .ilike("username", `%${query}%`)
    .limit(20);

  if (error) {
    console.error("Error searching users:", error);
    return [];
  }

  return data;
}

async function getMostFollowedUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      username,
      follower_count
    `,
    )
    .order("follower_count", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching most followed users:", error);
    return [];
  }

  return data;
}

interface UserItemProps {
  user: {
    id: string;
    username: string;
    follower_count?: number;
  };
  colors: any;
}

const UserItem = ({ user, colors }: UserItemProps) => (
  <TouchableOpacity
    key={user.id}
    style={[styles.userItem, { borderBottomColor: colors.border }]}
    onPress={() => {
      router.push({
        pathname: "/(modals)/profile",
        params: { userId: user.id },
      });
    }}
  >
    <View style={styles.userContent}>
      <View style={styles.avatarContainer}>
        <Image
          style={[styles.avatar, { backgroundColor: colors.card }]}
          source={{ uri: getProfileImageUrl(user.id) ?? undefined }}
          cachePolicy="memory"
        />
      </View>
      <View style={styles.userInfo}>
        <ThemedText type="defaultSemiBold">{user.username}</ThemedText>
        {user.follower_count !== undefined && (
          <ThemedText style={styles.followerCount}>
            {user.follower_count} followers
          </ThemedText>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

export default function FindFriendsScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["users", debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const { data: popularUsers, isLoading: isLoadingPopular } = useQuery({
    queryKey: ["popular-users"],
    queryFn: getMostFollowedUsers,
  });

  const isLoading = debouncedQuery ? isSearching : isLoadingPopular;
  const users = debouncedQuery ? searchResults : popularUsers;

  return (
    <BodyScrollView style={styles.container}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color={colors.primary} />
            </TouchableOpacity>
          ),
          headerSearchBarOptions: {
            placeholder: "Search by username",
            onChangeText: (event) => setSearchQuery(event.nativeEvent.text),
            textColor: colors.text,
            headerIconColor: colors.text,
            hintTextColor: colors.text,
            tintColor: colors.primary,
          },
        }}
      />
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : !searchQuery && !users?.length ? (
          <ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>
            No users found
          </ThemedText>
        ) : (
          <View style={styles.results}>
            {users?.map((user) => (
              <UserItem key={user.id} user={user} colors={colors} />
            ))}
          </View>
        )}
      </View>
    </BodyScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  results: {
    gap: 8,
  },
  userItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  userContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    aspectRatio: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  userInfo: {
    flex: 1,
  },
  followerCount: {
    fontSize: 13,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
});
