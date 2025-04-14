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

const ExplorePage = () => {
  const { colors } = useTheme();

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

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.push("/(modals)/create_post")}
              >
                <Ionicons name="add" color={colors.primary} size={24} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(modals)/add_friends")}
              >
                <Ionicons name="people" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
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
