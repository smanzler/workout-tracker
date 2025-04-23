import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { BodyScrollView } from "@/components/BodyScrollView";
import { useExplorePosts, useFollowingPosts } from "@/api/posts";
import { FlatList } from "react-native-gesture-handler";
import PostListItem from "@/components/PostListItem";
import { useAuth } from "@/providers/AuthProvider";
import { ThemedText } from "@/components/ThemedText";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/zeego/drop-down";

const ExplorePage = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [showExplore, setShowExplore] = useState(false);

  const explore = useExplorePosts(showExplore);
  const following = useFollowingPosts(!showExplore);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = showExplore ? explore : following;

  const posts = data?.pages.flat() ?? [];

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Stack.Screen options={{ headerRight: () => null }} />
        <ThemedText>You need to login to see this page</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <DropdownMenuRoot>
                <DropdownMenuTrigger>
                  <TouchableOpacity>
                    <Ionicons
                      name={showExplore ? "globe" : "people"}
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuItem
                    key="explore"
                    onSelect={() => setShowExplore(true)}
                  >
                    <DropdownMenuItemTitle>Explore</DropdownMenuItemTitle>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    key="following"
                    onSelect={() => setShowExplore(false)}
                  >
                    <DropdownMenuItemTitle>Following</DropdownMenuItemTitle>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuRoot>

              <TouchableOpacity
                onPress={() => router.push("/(modals)/create_post")}
              >
                <Ionicons name="add" color={colors.primary} size={24} />
              </TouchableOpacity>
            </View>
          ),
          headerTitle: showExplore ? "Explore" : "Following",
        }}
      />
      {posts.length === 0 && !isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ThemedText type="defaultSemiBold">
            {showExplore
              ? "No posts found."
              : "No posts found. Follow users to see their posts."}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostListItem post={item} />}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator /> : null
          }
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          automaticallyAdjustsScrollIndicatorInsets
          contentInsetAdjustmentBehavior="automatic"
          contentInset={{ bottom: 0 }}
          scrollIndicatorInsets={{ bottom: 0 }}
          style={{ paddingHorizontal: 20 }}
        />
      )}
    </>
  );
};

export default ExplorePage;

const styles = StyleSheet.create({});
