import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import Divider from "@/components/Divider";

const CreatePost = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => <Button onPress={() => {}} title="Cancel" />,
        }}
      />
      <View style={{ paddingHorizontal: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 20,
          }}
        >
          <ThemedText>Workout or Routine</ThemedText>

          <TouchableOpacity
            onPress={() => router.push("/(modals)/workout_picker")}
            style={{ flexDirection: "row" }}
          >
            <ThemedText></ThemedText>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Divider />
      </View>
    </SafeAreaView>
  );
};

export default CreatePost;

const styles = StyleSheet.create({});
