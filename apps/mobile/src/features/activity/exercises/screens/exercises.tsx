import { router, Stack } from "expo-router";
import { WorkoutIndicator } from "@/features/activity/workouts/components/workout-indicator";
import { ExerciseList } from "../../components/exercise-list";

export default function Exercises() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Exercises",
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="plus"
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
