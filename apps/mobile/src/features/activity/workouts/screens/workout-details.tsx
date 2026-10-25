import { ProfileAvatar } from "@/components/profile-avatar";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useProfile } from "@/hooks/use-profile";
import { useToolbarIcon } from "@/hooks/use-toolbar-icon";
import { authClient } from "@/lib/auth-client";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { QueryView } from "@/components/query-view";
import { WorkoutReceipt } from "../components/workout-receipt";
import { useWorkout } from "../hooks/use-workout";
import { useWorkoutMenu } from "../hooks/use-workout-menu";

function Author({ userId }: { userId: string }) {
  const { data: profile } = useProfile(userId);
  if (!profile) return null;

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/profile", params: { profileId: userId } })
      }
      className="flex-row items-center gap-2.5 self-start pb-2"
    >
      <ProfileAvatar profile={profile} size="sm" className="size-8" />
      <Text className="text-[15px] font-semibold">{profile.username}</Text>
    </Pressable>
  );
}

export default function WorkoutDetails() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const workoutQuery = useWorkout(workoutId);
  const showWorkoutMenu = useWorkoutMenu();
  const { data: session } = authClient.useSession();
  const optionsIcon = useToolbarIcon("ellipsis", "more-vert");

  return (
    <QueryView query={workoutQuery} errorTitle="Couldn't load workout">
      {(workout) => {
        const isMine = workout.userId === session?.user.id;

        return (
          <>
            <Stack.Screen
              options={{
                title: "",
                headerShadowVisible: false,
              }}
            />
            {isMine && (
              <Stack.Toolbar placement="right">
                <Stack.Toolbar.Button
                  icon={optionsIcon}
                  accessibilityLabel="Workout options"
                  onPress={() =>
                    showWorkoutMenu(workout, {
                      onDeleted: () => router.back(),
                    })
                  }
                />
              </Stack.Toolbar>
            )}
            <ScrollView
              contentInsetAdjustmentBehavior="automatic"
              contentContainerClassName="pb-safe-offset-4"
            >
              <WorkoutReceipt workout={workout}>
                {!isMine && <Author userId={workout.userId} />}
              </WorkoutReceipt>
            </ScrollView>
          </>
        );
      }}
    </QueryView>
  );
}
