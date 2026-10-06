import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import { BodyScrollView } from "@/components/body-scroll-view";

const Friends = () => {
  const { colors } = useTheme();

  return (
    <BodyScrollView>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <Text>Friends</Text>
    </BodyScrollView>
  );
};

export default Friends;

const styles = StyleSheet.create({});
