import { Text } from "@/components/ui/text";
import { useMenu } from "@/hooks/use-menu";
import type { Outputs } from "@rep/api";
import { router } from "expo-router";
import { Alert, View } from "react-native";
import { Tile } from "../../components/tile";
import { useDeleteRoutine } from "../hooks/use-delete-routine";

type Routine = Outputs["activity"]["routine"]["getAll"][number];

/** A routine in the grid. A long press shows its options. */
export function RoutineTile({
  routine,
  index,
}: {
  routine: Routine;
  index: number;
}) {
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

  const showOptions = () =>
    showMenu([
      { label: "Delete Routine", destructive: true, onSelect: confirmDelete },
    ]);

  return (
    <Tile
      index={index}
      testID="routine-card"
      accessibilityRole="button"
      accessibilityActions={[{ name: "longpress", label: "Options" }]}
      onAccessibilityAction={showOptions}
      onPress={() =>
        router.push({
          pathname: "/routine",
          params: { routineId: routine.id },
        })
      }
      onLongPress={showOptions}
    >
      <Text className="font-mono text-[30px] font-medium leading-none">
        {routine.exercises.length}
        <Text className="font-mono text-xs text-muted-foreground"> EX</Text>
      </Text>
      <View className="gap-0.5">
        <Text className="text-[17px] font-semibold" numberOfLines={2}>
          {routine.name}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {routine.exercises.map(({ exercise }) => exercise.title).join(", ")}
        </Text>
      </View>
    </Tile>
  );
}
