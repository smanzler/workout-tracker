import { QueryView } from "@/components/query-view";
import { RefetchControl } from "@/components/refetch-control";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { WorkoutSummary } from "@/components/workout-summary";
import { useCreateFollow } from "@/features/social/follows/hooks/use-create-follow";
import { useDeleteFollow } from "@/features/social/follows/hooks/use-delete-follow";
import { useFollow } from "@/features/social/follows/hooks/use-follow";
import { useFollowCounts } from "@/features/social/follows/hooks/use-follow-counts";
import { authClient } from "@/lib/auth-client";
import type { Outputs } from "@rep/api";
import { router } from "expo-router";
import { Dumbbell } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { FlatList, View } from "react-native";
import { useProfile } from "../hooks/use-profile";
import { useProfileWorkouts } from "../hooks/use-profile-workouts";

type Profile = Outputs["social"]["profile"]["getById"];

function FollowButton({ profileId }: { profileId: string }) {
  const { data: follow } = useFollow(profileId);
  const { mutate: createFollow, isPending: isFollowing } = useCreateFollow();
  const { mutate: deleteFollow, isPending: isUnfollowing } = useDeleteFollow();

  const toggle = () =>
    follow
      ? deleteFollow({ targetUserId: profileId })
      : createFollow({ targetUserId: profileId });

  return (
    <Button
      variant={follow ? "outline" : "default"}
      disabled={isFollowing || isUnfollowing}
      onPress={toggle}
      className="w-full"
    >
      <Text>{follow ? "Unfollow" : "Follow"}</Text>
    </Button>
  );
}

function ProfileHeader({
  profile,
  isOwnProfile,
}: {
  profile: Profile;
  isOwnProfile: boolean;
}) {
  const { data: counts } = useFollowCounts(profile.id);

  return (
    <View className="items-center gap-4 pb-4">
      <Avatar alt={profile.username} className="size-32">
        <AvatarImage source={{ uri: profile.avatarUrl ?? undefined }} />
        <AvatarFallback />
      </Avatar>
      <Text className="text-xl font-bold">{profile.username}</Text>
      <View className="flex-row gap-4">
        <Text className="text-muted-foreground">
          <Text className="font-bold">{counts?.followerCount ?? 0}</Text>{" "}
          followers
        </Text>
        <Text className="text-muted-foreground">
          <Text className="font-bold">{counts?.followingCount ?? 0}</Text>{" "}
          following
        </Text>
      </View>
      {!isOwnProfile && <FollowButton profileId={profile.id} />}
    </View>
  );
}

/** A profile with its follow counts and workouts. */
export function ProfileView({ profileId }: { profileId?: string }) {
  const { data: session } = authClient.useSession();
  const profileQuery = useProfile(profileId);
  const workoutsQuery = useProfileWorkouts(profileId);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = workoutsQuery;
  const isOwnProfile = session?.user.id === profileId;

  return (
    <QueryView query={profileQuery} errorTitle="Couldn't load profile">
      {(profile) => (
        <FlatList
          data={workoutsQuery.data?.pages.flatMap(({ items }) => items) ?? []}
          keyExtractor={({ id }) => id}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-3 p-4"
          refreshControl={
            <RefetchControl
              refetch={() =>
                Promise.all([profileQuery.refetch(), workoutsQuery.refetch()])
              }
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListHeaderComponent={
            <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
          }
          ListEmptyComponent={
            workoutsQuery.isPending ? (
              <Spinner />
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Icon as={Dumbbell} />
                  </EmptyMedia>
                  <EmptyTitle>No workouts yet</EmptyTitle>
                  <EmptyDescription>
                    {isOwnProfile
                      ? "Your finished workouts will show here."
                      : `${profile.username} has not logged a workout yet.`}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )
          }
          ListFooterComponent={isFetchingNextPage ? <Spinner /> : null}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/workout-details",
                  params: { workoutId: item.id },
                })
              }
            >
              <WorkoutSummary workout={item} />
            </Pressable>
          )}
        />
      )}
    </QueryView>
  );
}
