import { BodyScrollView } from "@/components/BodyScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useSettings, useSettingsActions } from "@/stores/settingsStore";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
} from "@/zeego/drop-down";
import { DropdownMenuTrigger } from "@/zeego/drop-down";
import { router, Stack, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import React from "react";
import { updateProfilePrivacy, useProfile } from "@/api/profile";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 32 }}>
      <ThemedText
        type="defaultSemiBold"
        style={{
          marginLeft: 16,
          marginBottom: 8,
          opacity: 0.6,
          textTransform: "uppercase",
          fontSize: 13,
        }}
      >
        {title}
      </ThemedText>
      <View
        style={[
          styles.section,
          {
            backgroundColor: colors.card,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

interface SettingsItemProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  value?: string;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  description?: string;
}

function SettingsItem({
  label,
  icon,
  iconColor,
  onPress,
  value,
  isToggle,
  toggleValue,
  onToggle,
  description,
}: SettingsItemProps) {
  const { colors } = useTheme();

  const content = (
    <>
      <View style={styles.itemContent}>
        {icon && (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: iconColor || colors.primary,
              },
            ]}
          >
            <Ionicons name={icon} size={18} color="white" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <ThemedText type="default">{label}</ThemedText>
            {description && (
              <Pressable
                onPress={(event) => {
                  const { pageX, pageY } = event.nativeEvent;
                  router.push({
                    pathname: "/(modals)/info_modal",
                    params: {
                      description,
                      title: label,
                      x: pageX,
                      y: pageY,
                    },
                  });
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <Ionicons
                  name="information-circle"
                  size={16}
                  color={colors.text}
                  style={{ opacity: 0.6 }}
                />
              </Pressable>
            )}
          </View>
        </View>
      </View>
      <View style={styles.itemRight}>
        {isToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            ios_backgroundColor={colors.border}
          />
        ) : (
          <>
            {value && <ThemedText style={{ opacity: 0.6 }}>{value}</ThemedText>}
            {onPress && !value && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text}
                style={{ opacity: 0.3 }}
              />
            )}
          </>
        )}
      </View>
    </>
  );

  const containerStyle = [
    styles.item,
    {
      borderBottomColor: colors.border,
    },
  ];

  return (
    <View>
      {isToggle ? (
        <View style={containerStyle}>{content}</View>
      ) : (
        <TouchableOpacity onPress={onPress} style={containerStyle}>
          {content}
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const showExploreTab = useSettings();
  const { setShowExploreTab } = useSettingsActions();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profileData } = useProfile(user?.id);

  const handlePrivacyToggle = async (value: boolean) => {
    if (!user?.id) return;
    try {
      await updateProfilePrivacy(value, user?.id);

      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }
    } catch (error) {
      console.error("Failed to update privacy setting:", error);
    }
  };

  return (
    <BodyScrollView style={styles.container}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <SettingsSection title="Privacy">
        <SettingsItem
          label="Public Profile"
          icon="lock-open"
          iconColor="#32CD32"
          isToggle
          toggleValue={profileData?.profile.is_public ?? true}
          onToggle={handlePrivacyToggle}
          description="When enabled, your profile and workouts will be visible to everyone. When disabled, only approved followers can see your content."
        />
      </SettingsSection>

      <SettingsSection title="Features">
        <SettingsItem
          label="Explore Tab"
          icon="compass"
          iconColor="#007AFF"
          isToggle
          toggleValue={showExploreTab}
          onToggle={setShowExploreTab}
          description="Enable or disable the Explore tab where you can discover new workouts and routines from the community"
        />
      </SettingsSection>
    </BodyScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 16,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBox: {
    width: Dimensions.get("window").width - 48,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    overflow: "visible",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
