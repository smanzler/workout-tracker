import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import { useExplorePosts } from "@/api/posts";
import { FlatList } from "react-native-gesture-handler";
import PostListItem from "@/components/PostListItem";
import { useAuth } from "@/providers/AuthProvider";
import { ThemedText } from "@/components/ThemedText";

const ExplorePage = () => {
  const { colors } = useTheme();
  const { user } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useExplorePosts();

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
            <TouchableOpacity
              onPress={() => router.push("/(modals)/create_post")}
            >
              <Ionicons name="add" color={colors.primary} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={posts}
        renderItem={({ item }) => <PostListItem post={item} />}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        automaticallyAdjustsScrollIndicatorInsets
        contentInsetAdjustmentBehavior="automatic"
        contentInset={{ bottom: 0 }}
        scrollIndicatorInsets={{ bottom: 0 }}
        style={{ paddingHorizontal: 20 }}
      />
    </>
  );
};

export default ExplorePage;

const styles = StyleSheet.create({});
