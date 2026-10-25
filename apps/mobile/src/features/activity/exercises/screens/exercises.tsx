import { router, Stack } from "expo-router";
import { useToolbarIcon } from "@/hooks/use-toolbar-icon";
import { WorkoutIndicator } from "@/features/activity/workouts/components/workout-indicator";
import { ExerciseList } from "../../components/exercise-list";

export default function Exercises() {
  const newExerciseIcon = useToolbarIcon("plus", "add");

  return (
    <>
      <Stack.Screen
        options={{
          title: "Exercises",
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={newExerciseIcon}
          accessibilityLabel="New exercise"
          onPress={() => router.push("/new-exercise")}
        />
      </Stack.Toolbar>
      <ExerciseList
        onPress={({ id, title }) =>
          router.push({
            pathname: "/exercise-history",
            params: { exerciseId: id, title },
          })
        }
      />
      <WorkoutIndicator />
    </>
  );
}
