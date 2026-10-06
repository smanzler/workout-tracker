import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { router, Stack } from "expo-router";
import { Plus } from "lucide-react-native";
import { ExerciseList } from "../../components/exercise-list";

export default function Exercises() {
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              accessibilityLabel="New exercise"
              onPress={() => router.push("/new-exercise")}
            >
              <Icon as={Plus} />
            </Button>
          ),
        }}
      />
      <ExerciseList
        onPress={({ id, title }) =>
          router.push({
            pathname: "/exercise-history",
            params: { exerciseId: id, title },
          })
        }
      />
    </>
  );
}
