import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useMenu } from "@/hooks/use-menu";
import type { Outputs } from "@rep/api";
import { router } from "expo-router";
import { Ellipsis } from "lucide-react-native";
import { Pressable } from "@/components/ui/pressable";
import { Alert } from "react-native";
import { useDeleteRoutine } from "../hooks/use-delete-routine";

type Routine = Outputs["activity"]["routine"]["getAll"][number];

export function RoutineCard({ routine }: { routine: Routine }) {
  const showMenu = useMenu();
  const { mutate: deleteRoutine } = useDeleteRoutine();

  const confirmDelete = () =>
    Alert.alert("Delete routine?", `"${routine.name}" will be deleted.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteRoutine(
            { id: routine.id },
            {
              onError: () =>
                Alert.alert("Could not delete routine", "Try again later."),
            },
          ),
      },
    ]);

  return (
    <Card className="flex-row items-start gap-2 py-3 pl-4 pr-2">
      <Pressable
        testID="routine-card"
        className="flex-1 gap-1 pt-2"
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: "/routine",
            params: { routineId: routine.id },
          })
        }
      >
        <CardTitle className="text-lg" numberOfLines={1}>
          {routine.name}
        </CardTitle>
        <Text variant="muted" numberOfLines={2}>
          {routine.exercises.map(({ exercise }) => exercise.title).join(", ")}
        </Text>
      </Pressable>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        accessibilityLabel={`${routine.name} options`}
        onPress={() =>
          showMenu([
            {
              label: "Delete Routine",
              destructive: true,
              onSelect: confirmDelete,
            },
          ])
        }
      >
        <Icon as={Ellipsis} />
      </Button>
    </Card>
  );
}
