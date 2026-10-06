import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { WorkoutSummary } from "@/components/workout-summary";
import { cn } from "@/lib/utils";
import type { Outputs } from "@rep/api";
import { router } from "expo-router";
import { Heart } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { View } from "react-native";
import { useGiveKudos, useRemoveKudos } from "../hooks/use-kudos";

type FeedWorkout = Outputs["social"]["feed"]["get"][number];

/** A friend's workout with their name and a button that gives kudos. */
export function FeedWorkoutCard({ workout }: { workout: FeedWorkout }) {
  const { mutate: giveKudos, isPending: isGiving } = useGiveKudos();
  const { mutate: removeKudos, isPending: isRemoving } = useRemoveKudos();
  const { profile, hasGivenKudos, kudosCount } = workout;

  const toggleKudos = () =>
    hasGivenKudos
      ? removeKudos({ workoutId: workout.id })
      : giveKudos({ workoutId: workout.id });

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/profile",
              params: { profileId: profile.id },
            })
          }
          className="flex-row items-center gap-3"
        >
          <Avatar alt="" className="size-9">
            <AvatarImage source={{ uri: profile.avatarUrl ?? undefined }} />
            <AvatarFallback />
          </Avatar>
          <Text className="font-semibold">{profile.username}</Text>
        </Pressable>

        <Button
          variant="ghost"
          size="sm"
          disabled={isGiving || isRemoving}
          accessibilityLabel={hasGivenKudos ? "Remove kudos" : "Give kudos"}
          onPress={toggleKudos}
        >
          <Icon
            as={Heart}
            className={cn("size-5", hasGivenKudos && "text-red-500")}
            fill={hasGivenKudos ? "#ef4444" : "none"}
          />
          <Text>{kudosCount}</Text>
        </Button>
      </View>

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/workout-details",
            params: { workoutId: workout.id },
          })
        }
      >
        <WorkoutSummary workout={workout} />
      </Pressable>
    </View>
  );
}
