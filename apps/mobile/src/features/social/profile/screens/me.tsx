import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BodyScrollView } from "@/components/ui/body-scroll-view";
import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
import { Bell, Settings } from "lucide-react-native";
import { View } from "react-native";
import { HeaderLink } from "../components/header-link";
import { useMyProfile } from "../hooks/use-my-profile";

export default function Me() {
  const { data: profile } = useMyProfile();

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <HeaderLink
              icon={Settings}
              label="Settings"
              href="/(modals)/settings"
            />
          ),
          headerRight: () => (
            <HeaderLink
              icon={Bell}
              label="Notifications"
              href="/notifications"
            />
          ),
        }}
      />
      <BodyScrollView>
        <View className="items-center gap-4">
          <Avatar alt={profile?.username ?? ""} className="size-32">
            <AvatarImage source={{ uri: profile?.avatarUrl ?? undefined }} />
            <AvatarFallback />
          </Avatar>
          <Text className="text-xl font-bold">{profile?.username}</Text>
        </View>
      </BodyScrollView>
    </>
  );
}
