import { BodyScrollView } from "@/components/BodyScrollView";
import database, {
  setsCollection,
  workoutExercisesCollection,
  workoutsCollection,
} from "@/db";
import { useLocalSearchParams, router, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useWorkoutActions, useWorkoutExercises } from "@/stores/workoutStore";
import EditWorkoutExerciseList from "@/components/EditWorkoutExerciseList";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Q } from "@nozbe/watermelondb";
import { useAuth } from "@/providers/AuthProvider";
import { checkPRs } from "@/utils/PRs";

const EditWorkout = () => {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [workoutName, setWorkoutName] = useState("");
  const [loading, setLoading] = useState(false);
  const { clearWorkout, addInitialExercises } = useWorkoutActions();
  const exercises = useWorkoutExercises();
  const inputRefs = useRef<(TextInput | null)[][]>([]);
  const { colors } = useTheme();
  const { user } = useAuth();

  const loadWorkout = async () => {
    if (!workoutId) return;

    try {
      const workout = await workoutsCollection.find(workoutId);
      setWorkoutName(workout.name);

      clearWorkout();

      const workoutExercises = await workout.workoutExercises.fetch();
      const loadedExercises = await Promise.all(
        workoutExercises.map(async (we) => {
          const exercise = await we.exercise;
          const sets = await we.sets.fetch();

          return {
            id: we.id,
            exercise,
            sets: sets.map((set) => ({
              id: set.id,
              reps: set.reps?.toString(),
              weight: set.weight?.toString(),
              completed: set.completed,
              position: set.position,
            })),
          };
        })
      );

      addInitialExercises(loadedExercises);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!workoutId) return;

    // Check if all sets are complete
    const hasIncompleteSets = exercises.some((exercise) =>
      exercise.sets.some((set) => !set.completed)
    );

    if (hasIncompleteSets) {
      Alert.alert(
        "Incomplete Workout",
        "Please complete all sets before saving the workout.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);

    try {
      const workout = await workoutsCollection.find(workoutId);
      const batchOps: any[] = [];
      const usedWorkoutExerciseIds: string[] = [];
      const usedSetIds: string[] = [];

      for (const draftWE of exercises) {
        let we;
        const weResults = await workoutExercisesCollection
          .query(Q.where("id", draftWE.id), Q.take(1))
          .fetch();
        we = weResults[0];

        if (we) {
          console.log("we id", we.id);

          batchOps.push(
            we.prepareUpdate((rec: any) => {
              // @ts-ignore
              rec.exercise.set(draftWE.exercise);
            })
          );
        } else {
          console.log("we not found creating we");
          we = workoutExercisesCollection.prepareCreate((rec) => {
            // @ts-ignore
            rec.workout.set(workout);
            // @ts-ignore
            rec.exercise.set(draftWE.exercise);
            rec.userId = user?.id;
          });
          batchOps.push(we);
        }

        usedWorkoutExerciseIds.push(we.id);

        for (const draftSet of draftWE.sets) {
          const setResults = await setsCollection
            .query(Q.where("id", draftSet.id), Q.take(1))
            .fetch();

          const set = setResults[0];
          if (set) {
            console.log("set found updating set", set.id);
            batchOps.push(
              set.prepareUpdate((rec) => {
                rec.reps = draftSet.reps ? parseInt(draftSet.reps) : undefined;
                rec.weight = draftSet.weight
                  ? parseFloat(draftSet.weight)
                  : undefined;
                rec.completed = draftSet.completed;
              })
            );
            usedSetIds.push(set.id);
          } else {
            console.log("set not found creating set", draftSet.id);
            const newSet = setsCollection.prepareCreate((rec) => {
              // @ts-ignore
              rec.workoutExercise.set(we);
              rec.reps = draftSet.reps ? parseInt(draftSet.reps) : undefined;
              rec.weight = draftSet.weight
                ? parseFloat(draftSet.weight)
                : undefined;
              rec.completed = draftSet.completed;
              rec.userId = user?.id;
            });
            batchOps.push(newSet);
            usedSetIds.push(newSet.id);
          }
        }
      }

      const existingWEs = await workoutExercisesCollection
        .query(Q.where("workout_id", workoutId))
        .fetch();

      for (const we of existingWEs) {
        if (!usedWorkoutExerciseIds.includes(we.id)) {
          const sets = await setsCollection
            .query(Q.where("workout_exercise_id", we.id))
            .fetch();
          batchOps.push(...sets.map((s) => s.markAsDeleted()));
          batchOps.push(we.markAsDeleted());
        } else {
          const sets = await setsCollection
            .query(Q.where("workout_exercise_id", we.id))
            .fetch();
          for (const set of sets) {
            if (!usedSetIds.includes(set.id)) {
              batchOps.push(set.markAsDeleted());
            }
          }
        }
      }

      await database.write(async () => {
        await database.batch(...batchOps);
      });

      await checkPRs(workout, await workout.workoutExercises.fetch());

      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to save workout changes. Please try again. ${error}`
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  backgroundColor: colors.text
                    .replace("rgb", "rgba")
                    .replace(")", ", 0.1)"),
                },
              ]}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () =>
            loading ? (
              <ActivityIndicator />
            ) : (
              <Button title="Save" onPress={handleSave}></Button>
            ),
        }}
      />
      <BodyScrollView style={styles.container}>
        <TextInput
          style={{
            fontSize: 24,
            fontWeight: "600",
            color: colors.text,
            marginVertical: 20,
          }}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Workout Name"
          placeholderTextColor={colors.text
            .replace("rgb", "rgba")
            .replace(")", ", 0.4)")}
        />

        <EditWorkoutExerciseList exercises={exercises} inputRefs={inputRefs} />
      </BodyScrollView>
    </>
  );
};

export default EditWorkout;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  closeButton: {
    padding: 6,
    borderRadius: 100,
  },
});
