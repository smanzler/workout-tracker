import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import { router } from "expo-router";
import { Pressable } from "@/components/ui/pressable";

type Profile = Outputs["social"]["profile"]["getById"];

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/profile", params: { profileId: profile.id } })
      }
      className="flex-row items-center gap-4"
    >
      <Avatar alt="" className="size-10">
        <AvatarImage source={{ uri: profile.avatarUrl ?? undefined }} />
        <AvatarFallback />
      </Avatar>
      <Text className="font-medium">{profile.username}</Text>
    </Pressable>
  );
}
