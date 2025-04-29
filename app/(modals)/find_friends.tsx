import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { BodyScrollView } from "@/components/BodyScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { useDebounce } from "@/hooks/useDebounce";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { getProfileImageUrl } from "@/api/profile";
import { Ionicons } from "@expo/vector-icons";

async function searchUsers(query: string) {
  if (!query) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .ilike("username", `%${query}%`)
    .limit(20);

  if (error) {
    console.error("Error searching users:", error);
    return [];
  }

  return data;
}

export default function FindFriendsScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

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
        ) : !searchQuery ? (
          <ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>
            Search for users to connect with
          </ThemedText>
        ) : users?.length === 0 ? (
          <ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>
            No users found
          </ThemedText>
        ) : (
          <View style={styles.results}>
            {users?.map((user) => (
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
                      source={{ uri: getProfileImageUrl(user.id) }}
                      cachePolicy="memory-disk"
                    />
                  </View>
                  <ThemedText type="defaultSemiBold">
                    {user.username}
                  </ThemedText>
                </View>
              </TouchableOpacity>
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
});
