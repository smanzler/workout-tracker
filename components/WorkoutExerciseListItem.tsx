import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { withObservables } from "@nozbe/watermelondb/react";
import { WorkoutExercise } from "@/models/WorkoutExercise";
import { Exercise } from "@/models/Exercise";
import { Set } from "@/models/Set";
import SetListItem from "./SetListItem";
import { Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemTitle,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "@/zeego/drop-down";
import database, { setsCollection } from "@/db";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/providers/AuthProvider";

const WorkoutExerciseListItem = ({
  workoutExercise,
  exercise,
  sets,
}: {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  sets: Set[];
}) => {
  const theme = useTheme();
  const { user } = useAuth();

  const handleDelete = () => {
    database.write(async () => {
      for (const set of sets) {
        await set.markAsDeleted();
      }

      await workoutExercise.markAsDeleted();
    });
  };

  const handleAddSet = async () => {
    Keyboard.dismiss();

    await database.write(async () => {
      const nextOrder = sets.length + 1;

      const previousSet = sets.length > 0 ? sets[sets.length - 1] : null;

      await setsCollection.create((set) => {
        // @ts-ignore
        set.workoutExercise.set(workoutExercise);
        set.workoutStartTime = workoutExercise.workout.startTime;
        set.order = nextOrder;
        set.weight = previousSet ? previousSet.weight : undefined;
        set.reps = previousSet ? previousSet.reps : undefined;
        user && (set.userId = user.id);
      });
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.headerContainer}>
        <Text
          style={[styles.headerText, { color: theme.colors.text }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {exercise.title}
        </Text>
        <DropdownMenuRoot>
          <DropdownMenuTrigger>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.colors.background }]}
            >
              <Entypo
                name="dots-three-horizontal"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem destructive key="delete" onSelect={handleDelete}>
              <DropdownMenuItemTitle>Delete Exercise</DropdownMenuItemTitle>
              <DropdownMenuItemIcon ios={{ name: "trash" }} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      </View>
      <View style={styles.setsHeader}>
        <Text
          style={[
            styles.setHeaderText,
            {
              width: 30,
              textAlign: "center",
              color: theme.colors.text,
            },
          ]}
        >
          Set
        </Text>
        <Text
          style={[
            styles.setHeaderText,
            { width: 80, textAlign: "center", color: theme.colors.text },
          ]}
        >
          Previous
        </Text>
        <View style={styles.rightContainer}>
          <Text
            style={[
              styles.setHeaderText,
              { width: 40, textAlign: "center", color: theme.colors.text },
            ]}
          >
            lbs
          </Text>
          <Text
            style={[
              styles.setHeaderText,
              { width: 40, textAlign: "center", color: theme.colors.text },
            ]}
          >
            Reps
          </Text>
          <View style={{ width: 30, alignItems: "center" }}>
            <FontAwesome5 name="check" size={16} color={theme.colors.text} />
          </View>
        </View>
      </View>
      {sets.map((set) => (
        <SetListItem
          key={set.id}
          set={set}
          workoutExerciseId={workoutExercise.id}
        />
      ))}

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.colors.background }]}
        onPress={handleAddSet}
      >
        <Feather name="plus" size={16} color={theme.colors.text} />
        <Text style={[styles.addBtnText, { color: theme.colors.text }]}>
          Add Set
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const enhance = withObservables(["workoutExercise"], ({ workoutExercise }) => ({
  workoutExercise,
  exercise: workoutExercise.exercise,
  sets: workoutExercise.sets,
}));

export default enhance(WorkoutExerciseListItem);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 20,
    gap: 10,
  },
  btn: {
    paddingHorizontal: 5,
    backgroundColor: "#e8e8e8",
    borderRadius: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    flexShrink: 1,
  },
  setsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
    marginHorizontal: 20,
  },
  rightContainer: {
    flexDirection: "row",
    gap: 10,
  },
  setHeaderText: {
    fontWeight: 500,
    fontSize: 16,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    fontWeight: 500,
    padding: 5,
    marginHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  addBtnText: {
    fontWeight: 500,
  },
});
