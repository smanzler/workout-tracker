import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { ThemedText } from "@/components/themed-text";
import { RoutineExercise } from "@/db/models/routine-exercise";
import { Exercise } from "@/db/models/exercise";
import { RoutineSet } from "@/db/models/routine-set";

const RoutineExerciseView = ({
  routineExercise,
}: {
  routineExercise: RoutineExercise;
}) => {
  const [exercise, setExercise] = useState<Exercise>();
  const [sets, setSets] = useState<RoutineSet[]>();

  useEffect(() => {
    const load = async () => {
      // @ts-ignore
      const e = await routineExercise.exercise.fetch();
      setExercise(e);

      const sets = await routineExercise.routineSets.fetch();
      setSets(sets);
    };

    load();
  });

  return (
    <View>
      <ThemedText style={{ fontSize: 16, fontWeight: 600 }}>
        {sets && sets.length + " × "}
        {exercise?.title}
      </ThemedText>
      <ThemedText style={{ fontSize: 16, fontWeight: 600, opacity: 0.6 }}>
        {exercise?.muscleGroup}
      </ThemedText>
    </View>
  );
};

export default RoutineExerciseView;

const styles = StyleSheet.create({});
