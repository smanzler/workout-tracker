import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Routine } from "@/models/Routine";
import { ThemedText } from "./ThemedText";
import { useTheme } from "@react-navigation/native";
import { withObservables } from "@nozbe/watermelondb/react";
import { RoutineExercise } from "@/models/RoutineExercise";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/zeego/drop-down";
import { Entypo } from "@expo/vector-icons";
import database from "@/db";
import { router } from "expo-router";
import ButtonWithIcon from "./ButtonWithIcon";

const RoutineItem = ({
  routine,
  routineExercises,
}: {
  routine: Routine;
  routineExercises: RoutineExercise[];
}) => {
  const { colors } = useTheme();

  const [exerciseNames, setExerciseNames] = useState<string>("");

  useEffect(() => {
    const fetchNames = async () => {
      const names = await Promise.all(
        routineExercises.map(async (re) => {
          // @ts-ignore
          const ex = await re.exercise.fetch();
          return ex.title;
        })
      );
      setExerciseNames(names.join(", "));
    };

    fetchNames();
  }, [routineExercises]);

  const handleDelete = () => {
    if (!routine) {
      console.error("No routine to delete");
      return;
    }

    try {
      database.write(async () => {
        const routineExercises = await routine.routineExercises.fetch();

        const setsToDelete = await Promise.all(
          routineExercises.map((re) => re.routineSets.fetch())
        );

        const routineExerciseDeletions = await Promise.all(
          routineExercises.map((re) => re.markAsDeleted())
        );
        const routineSetDeletions = await Promise.all(
          setsToDelete.flat().map((set) => set.markAsDeleted())
        );
        const routineDeletion = await routine.markAsDeleted();

        const batchOps = [
          ...routineExerciseDeletions,
          ...routineSetDeletions,
          routineDeletion,
        ];

        await database.batch(...batchOps);
      });
    } catch (error) {
      console.error("Failed to delete Routine:", error);
    }
  };

  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/(modals)/routine_modal",
          params: { routineId: routine.id },
        });
      }}
      style={[styles.container, { backgroundColor: colors.card }]}
    >
      <View style={styles.rowHeader}>
        <ThemedText style={{ fontSize: 20, fontWeight: 600 }}>
          {routine.name}
        </ThemedText>

        <DropdownMenuRoot>
          <DropdownMenuTrigger>
            <ButtonWithIcon>
              <Entypo
                name="dots-three-horizontal"
                size={24}
                color={colors.text}
              />
            </ButtonWithIcon>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem destructive key="delete" onSelect={handleDelete}>
              <DropdownMenuItemTitle>Delete Routine</DropdownMenuItemTitle>
              <DropdownMenuItemIcon ios={{ name: "trash" }} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </View>

      <ThemedText style={{ fontSize: 18, fontWeight: 600, opacity: 0.6 }}>
        {exerciseNames}
      </ThemedText>
    </Pressable>
  );
};

const enhance = withObservables(["routine"], ({ routine }) => ({
  routine: routine,
  routineExercises: routine.routineExercises,
}));

export default enhance(RoutineItem);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btn: {
    paddingHorizontal: 5,
    borderRadius: 10,
  },
});
