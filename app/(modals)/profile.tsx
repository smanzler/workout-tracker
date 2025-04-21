import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { getProfileImageUrl, useProfile } from "@/api/profile";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import { Image } from "expo-image";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/Button";
import { chunkArray } from "@/utils/format";

const Profile = () => {
  const { colors } = useTheme();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { data: profile } = useProfile(userId);

  const chunkedPosts = chunkArray(profile?.posts || [], 3);

  useEffect(() => {
    console.log("profile", profile);
  }, [profile]);

  return (
    <BodyScrollView>
      <Stack.Screen
        options={{
          headerTitle: profile?.profile.username,
          headerLeft: () => (
            <TouchableOpacity>
              <Ionicons
                name="chevron-back"
                size={28}
                color={colors.primary}
                onPress={() => router.back()}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <View
        style={{
          alignItems: "center",
          marginVertical: 20,
          width: 200,
          margin: "auto",
          gap: 20,
        }}
      >
        <Image
          style={{
            backgroundColor: colors.card,
            width: 150,
            aspectRatio: 1,
            borderRadius: 75,
          }}
          source={{ uri: getProfileImageUrl(userId, Date.now()) }}
        />
        <ThemedText type="defaultSemiBold">
          {profile?.profile.bio || "User does not have a bio"}
        </ThemedText>

        <Button>Follow</Button>
      </View>

      <ThemedText style={{ marginLeft: 20 }} type="subtitle">
        Posts
      </ThemedText>

      <View
        style={{ flex: 1, borderTopColor: colors.border, borderTopWidth: 1 }}
      >
        {profile?.posts.length === 0 ? (
          <View>
            <ThemedText
              type="subtitle"
              style={{ textAlign: "center", marginTop: 50 }}
            >
              No Posts
            </ThemedText>
          </View>
        ) : (
          chunkedPosts.map((row, index) => {
            const placeholdersNeeded = 3 - row.length;

            return (
              <View key={index} style={{ flexDirection: "row" }}>
                {row.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={{
                      flex: 1,
                      aspectRatio: 1,
                      margin: 5,
                      borderRadius: 10,
                      backgroundColor: colors.card,
                      justifyContent: "center",
                      alignItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    {p.preview?.startsWith("http") ? (
                      <Image
                        source={{ uri: p.preview }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    ) : (
                      <ThemedText
                        type="subtitle"
                        style={{
                          margin: 10,
                          color: colors.text,
                        }}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {p.preview}
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                ))}

                {Array.from({ length: placeholdersNeeded }).map((_, i) => (
                  <View
                    key={`placeholder-${i}`}
                    style={{
                      flex: 1,
                      aspectRatio: 1,
                      margin: 5,
                      backgroundColor: "transparent",
                    }}
                  />
                ))}
              </View>
            );
          })
        )}
      </View>
    </BodyScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({});
