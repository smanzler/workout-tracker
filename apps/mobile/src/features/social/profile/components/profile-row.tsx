import { ProfileAvatar } from "@/components/profile-avatar";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";

type Profile = Outputs["social"]["profile"]["getById"];

export function ProfileRow({ profile }: { profile: Profile }) {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/profile", params: { profileId: profile.id } })
      }
      className="min-h-[60px] flex-row items-center gap-3 border-b border-border py-2 pl-5 pr-3"
    >
      <ProfileAvatar profile={profile} size="sm" />
      <Text className="flex-1 text-[15px] font-medium" numberOfLines={1}>
        {profile.username}
      </Text>
      <Icon as={ChevronRight} className="size-[18px] text-muted-foreground" />
    </Pressable>
  );
}
