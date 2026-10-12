import { BodyScrollView } from "@/components/ui/body-scroll-view";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import type { Outputs } from "@rep/api";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Ellipsis } from "lucide-react-native";
import { View } from "react-native";
import { QueryView } from "@/components/query-view";
import { SetListCard } from "../../components/set-list-card";
import { useWorkout } from "../hooks/use-workout";
import { useWorkoutMenu } from "../hooks/use-workout-menu";
import { formatDate, formatTime } from "@/lib/date";
import { formatDuration } from "@/lib/duration";
import { formatWeight } from "@/lib/format";
import { sumVolume } from "@/lib/volume";
import { countPersonalRecords } from "@/lib/personal-records";

type Workout = Outputs["activity"]["workout"]["get"];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-1">
      <Text variant="muted">{label}</Text>
      <Text className="text-lg font-semibold">{value}</Text>
    </View>
  );
}

function WorkoutStats({ workout }: { workout: Workout }) {
  const sets = workout.exercises.flatMap(({ sets }) => sets);
  const volume = sumVolume(sets);

  return (
    <View className="gap-3">
      <Text variant="muted">
        {formatDate(workout.startedAt)} at {formatTime(workout.startedAt)}
      </Text>
      <View className="flex-row gap-3">
        <Stat
          label="Duration"
          value={formatDuration(
            workout.endedAt.getTime() - workout.startedAt.getTime(),
          )}
        />
        <Stat label="Volume" value={formatWeight(volume)} />
        <Stat label="PRs" value={countPersonalRecords(sets).toString()} />
      </View>
    </View>
  );
}

export default function WorkoutDetails() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const workoutQuery = useWorkout(workoutId);
  const showWorkoutMenu = useWorkoutMenu();
  const { data: session } = authClient.useSession();

  return (
    <QueryView query={workoutQuery} errorTitle="Couldn't load workout">
      {(workout) => (
        <>
          <Stack.Screen
            options={{
              title: workout.name,
              headerRight: () =>
                workout.userId === session?.user.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    accessibilityLabel="Workout options"
                    onPress={() =>
                      showWorkoutMenu(workout, {
                        onDeleted: () => router.back(),
                      })
                    }
                  >
                    <Icon as={Ellipsis} />
                  </Button>
                ),
            }}
          />
          <BodyScrollView>
            <WorkoutStats workout={workout} />
            {workout.exercises.map(({ id, exercise, notes, sets }) => (
              <SetListCard
                key={id}
                title={exercise.title}
                description={notes}
                sets={sets}
              />
            ))}
          </BodyScrollView>
        </>
      )}
    </QueryView>
  );
}
