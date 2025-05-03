import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
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
import ButtonWithIcon from "./ButtonWithIcon";
import WRExerciseItem from "./WRExerciseItem";

const WorkoutExerciseListItem = ({
  workoutExercise,
  exercise,
  sets,
  exerciseIndex,
  inputRefs,
}: {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  sets: Set[];
  exerciseIndex: number;
  inputRefs: React.MutableRefObject<(TextInput | null)[][]>;
}) => {
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
      const previousSet = sets.length > 0 ? sets[sets.length - 1] : null;

      await setsCollection.create((set) => {
        // @ts-ignore
        set.workoutExercise.set(workoutExercise);
        set.weight = previousSet ? previousSet.weight : undefined;
        set.reps = previousSet ? previousSet.reps : undefined;
        user && (set.userId = user.id);
      });
    });
  };

  return (
    <WRExerciseItem
      type="workout"
      exercise={exercise}
      sets={sets}
      workoutExercise={workoutExercise}
      exerciseIndex={exerciseIndex}
      inputRefs={inputRefs}
      handleDelete={handleDelete}
      handleAddSet={handleAddSet}
    />
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
    paddingVertical: 16,
    marginBottom: 20,
    borderRadius: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 16,
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
    marginHorizontal: 16,
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
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  addBtnText: {
    fontWeight: 500,
  },
});
