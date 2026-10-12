import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Tile } from "@/features/activity/components/tile";
import { RoutineTile } from "@/features/activity/routines/components/routine-tile";
import { useRoutines } from "@/features/activity/routines/hooks/use-routines";
import { router, Stack } from "expo-router";
import { Plus } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { QueryView } from "@/components/query-view";
import { WorkoutIndicator } from "../components/workout-indicator";
import { useStartWorkout } from "../hooks/use-start-workout";

export default function StartWorkout() {
  const startWorkout = useStartWorkout();
  const routinesQuery = useRoutines();
  const routines = routinesQuery.data ?? [];

  return (
    <>
      <Stack.Screen options={{ title: "Workout" }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="dumbbell"
          accessibilityLabel="Exercises"
          onPress={() => router.push("/start-workout/exercises")}
        />
      </Stack.Toolbar>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View className="flex-row flex-wrap border-t border-border">
          <Tile
            index={0}
            accessibilityRole="button"
            className="bg-brand"
            onPress={() => startWorkout()}
          >
            <Icon as={Plus} className="size-7 text-brand-foreground" />
            <View className="gap-0.5">
              <Text className="text-[17px] font-semibold text-brand-foreground">
                Empty Workout
              </Text>
              <Text className="font-mono text-[11px] tracking-wide text-brand-foreground/85">
                START FROM SCRATCH
              </Text>
            </View>
          </Tile>
          {routines.map((routine, index) => (
            <RoutineTile key={routine.id} routine={routine} index={index + 1} />
          ))}
          <Tile
            index={routines.length + 1}
            accessibilityRole="button"
            className="items-center justify-center"
            onPress={() =>
              router.push("/add-routine/add-exercises", { withAnchor: true })
            }
          >
            <Icon as={Plus} className="size-6 text-muted-foreground" />
            <Text className="font-mono text-[11px] tracking-wider text-muted-foreground">
              NEW ROUTINE
            </Text>
          </Tile>
        </View>

        <QueryView query={routinesQuery} errorTitle="Couldn't load routines">
          {() => null}
        </QueryView>
      </ScrollView>
      <WorkoutIndicator />
    </>
  );
}
