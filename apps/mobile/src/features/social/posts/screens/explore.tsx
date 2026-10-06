import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useRef } from "react";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import { useExplorePosts, useFollowingPosts } from "../lib/posts";
import { FlatList } from "react-native-gesture-handler";
import PostListItem from "../components/post-list-item";
import { useAuth } from "@/hooks/use-auth";
import { EmptyState } from "@/components/empty-state";
import { useNetwork } from "@/providers/network-provider";
import { useMenu } from "@/hooks/use-menu";

const ExplorePage = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const [showExplore, setShowExplore] = useState(false);
  const showMenu = useMenu();
  const isRefreshingRef = useRef(false);

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

  const handleRefresh = async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    await refetch();
    isRefreshingRef.current = false;
  };

  if (!isOnline) {
    return (
      <>
        <Stack.Screen options={{ headerRight: () => null }} />
        <EmptyState
          icon="globe-outline"
          title="You're Offline"
          description="Connect to the internet to view and interact with posts."
          buttonText="Retry"
          buttonIcon="refresh"
          onButtonPress={handleRefresh}
          isRefetching={isRefetching}
          onRefresh={handleRefresh}
        />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Stack.Screen options={{ headerRight: () => null }} />
        <EmptyState
          icon="log-in-outline"
          title="Login Required"
          description="Please login to view and interact with posts"
          buttonText="Login"
          buttonIcon="log-in"
          // @ts-ignore
          onButtonPress={() => router.replace("/(tabs)/")}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() =>
                  showMenu([
                    { label: "Explore", onSelect: () => setShowExplore(true) },
                    {
                      label: "Following",
                      onSelect: () => setShowExplore(false),
                    },
                  ])
                }
              >
                <Ionicons
                  name={showExplore ? "globe" : "people"}
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/find-friends")}>
                <Ionicons name="person-add" size={22} color={colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/create-post")}>
                <Ionicons name="add" color={colors.primary} size={24} />
              </TouchableOpacity>
            </View>
          ),
          headerTitle: showExplore ? "Explore" : "Following",
        }}
      />
      {!isOnline ? (
        <EmptyState
          icon="globe-outline"
          title="You're Offline"
          description="Connect to the internet to view and interact with posts."
          buttonText="Retry"
          buttonIcon="refresh"
          onButtonPress={handleRefresh}
          isRefetching={isRefetching}
        />
      ) : posts.length === 0 && !isLoading ? (
        <EmptyState
          icon={showExplore ? "globe-outline" : "people-outline"}
          title={showExplore ? "No Posts Yet" : "No Posts From Following"}
          description={
            showExplore
              ? "Be the first to share your workout! Create a post and inspire others."
              : "Start following people to see their workout posts here."
          }
          buttonText={showExplore ? "Create Post" : "Find Friends"}
          buttonIcon={showExplore ? "add" : "person-add"}
          onButtonPress={() =>
            router.push(showExplore ? "/create-post" : "/find-friends")
          }
          isRefetching={isRefetching}
          onRefresh={handleRefresh}
        />
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
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
            />
          }
          automaticallyAdjustsScrollIndicatorInsets
          contentInsetAdjustmentBehavior="automatic"
          contentInset={{ bottom: 0 }}
          scrollIndicatorInsets={{ bottom: 0 }}
          style={{ padding: 20 }}
        />
      )}
    </>
  );
};

export default ExplorePage;

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    minHeight: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContent: {
    alignItems: "center",
    padding: 20,
    maxWidth: 300,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontWeight: "600",
  },
});
