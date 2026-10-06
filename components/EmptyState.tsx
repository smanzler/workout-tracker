import {
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "expo-router/react-navigation";
import { ThemedText } from "./ThemedText";
import { ScrollView } from "react-native-gesture-handler";

interface EmptyStateProps {
  icon:
    | "globe-outline"
    | "people-outline"
    | "log-in-outline"
    | "create-outline"
    | "notifications-outline";
  title: string;
  description: string;
  buttonText?: string;
  buttonIcon?: string;
  onButtonPress?: () => void;
  isRefetching?: boolean;
  onRefresh?: () => void;
}

export const EmptyState = ({
  icon,
  title,
  description,
  buttonText,
  buttonIcon,
  onButtonPress,
  isRefetching,
  onRefresh,
}: EmptyStateProps) => {
  const { colors } = useTheme();

  const content = (
    <View style={styles.content}>
      <Ionicons name={icon} size={48} color={colors.text} style={styles.icon} />
      <ThemedText type="defaultSemiBold" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText style={styles.description}>{description}</ThemedText>
      {buttonText && buttonIcon && onButtonPress && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onButtonPress}
        >
          <Ionicons
            name={buttonIcon as any}
            size={20}
            color={colors.background}
            style={styles.buttonIcon}
          />
          <ThemedText style={[styles.buttonText, { color: colors.background }]}>
            {buttonText}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  if (onRefresh) {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={!!isRefetching} onRefresh={onRefresh} />
        }
        contentInset={{ bottom: 0 }}
        scrollIndicatorInsets={{ bottom: 0 }}
      >
        {content}
      </ScrollView>
    );
  }

  // Otherwise use a simple View
  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    padding: 20,
    maxWidth: 300,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
  },
  button: {
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
