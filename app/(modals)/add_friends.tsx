import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { router, Stack } from "expo-router";
import { BodyScrollView } from "@/components/BodyScrollViiew";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

const AddFriends = () => {
  const { colors } = useTheme();

  return (
    <BodyScrollView>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: "Search",
            onSearchButtonPress(e) {},
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
    </BodyScrollView>
  );
};

export default AddFriends;

const styles = StyleSheet.create({});
