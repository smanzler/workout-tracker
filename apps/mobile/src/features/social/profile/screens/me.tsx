import { NotificationsBellButton } from "@/features/notifications/components/notifications-bell-button";
import { Stack } from "expo-router";
import { Settings, Users } from "lucide-react-native";
import { View } from "react-native";
import { HeaderLink } from "../../components/header-link";
import { ProfileView } from "../components/profile-view";
import { useMyProfile } from "../hooks/use-my-profile";

export default function Me() {
  const { data: profile } = useMyProfile();

  return (
    <>
      <Stack.Screen
        options={{
          title: "You",
          headerLeft: () => (
            <HeaderLink
              icon={Settings}
              label="Settings"
              href="/(modals)/settings"
            />
          ),
          headerRight: () => (
            <View className="flex-row items-center">
              <NotificationsBellButton />
              <HeaderLink icon={Users} label="Friends" href="/friends" />
            </View>
          ),
        }}
      />
      <ProfileView profileId={profile?.id} />
    </>
  );
}
