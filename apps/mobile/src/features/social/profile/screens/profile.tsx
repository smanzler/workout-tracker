import { Stack, useLocalSearchParams } from "expo-router";
import { ProfileView } from "../components/profile-view";
import { useProfile } from "@/hooks/use-profile";

export default function Profile() {
  const { profileId } = useLocalSearchParams<{ profileId?: string }>();
  const { data: profile } = useProfile(profileId);

  return (
    <>
      <Stack.Screen options={{ title: profile?.username ?? "" }} />
      <ProfileView profileId={profileId} />
    </>
  );
}
