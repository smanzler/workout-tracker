import { Button } from "@/components/ui/button";
import { BodyScrollView } from "@/components/ui/body-scroll-view";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { RoutineCard } from "@/features/activity/routines/components/routine-card";
import { useRoutines } from "@/features/activity/routines/hooks/use-routines";
import { router } from "expo-router";
import { ClipboardList, Plus } from "lucide-react-native";
import { View } from "react-native";
import { QueryView } from "@/components/query-view";
import { useStartWorkout } from "../hooks/use-start-workout";

const openNewRoutine = () => router.push("/add-routine");

export default function StartWorkout() {
  const startWorkout = useStartWorkout();
  const routinesQuery = useRoutines();

  return (
    <BodyScrollView>
      <Button size="lg" onPress={() => startWorkout()}>
        <Text>Start Empty Workout</Text>
      </Button>

      <View className="mt-6 flex-row items-center justify-between">
        <Text variant="h3">Routines</Text>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          accessibilityLabel="New routine"
          onPress={openNewRoutine}
        >
          <Icon as={Plus} />
        </Button>
      </View>

      <QueryView query={routinesQuery} errorTitle="Couldn't load routines">
        {(routines) =>
          routines.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Icon as={ClipboardList} />
                </EmptyMedia>
                <EmptyTitle>No routines</EmptyTitle>
                <EmptyDescription>
                  Save the exercises you repeat, and start them in one tap.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onPress={openNewRoutine}>
                  <Text>Create Routine</Text>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            routines.map((routine) => (
              <RoutineCard key={routine.id} routine={routine} />
            ))
          )
        }
      </QueryView>
    </BodyScrollView>
  );
}
