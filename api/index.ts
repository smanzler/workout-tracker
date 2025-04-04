import database, { exercisesCollection } from "@/db";
import { supabase } from "@/lib/supabase";
import { Exercise } from "@/models/Exercise";
import { Q } from "@nozbe/watermelondb";

type ServerExercise = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  muscle_group: string;
  category: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export async function pullDefaultExercises() {
  try {
    const { data, error } = await supabase.rpc("pull_default_exercises");

    if (error) {
      console.error("Error fetching default exercises:", error);
      throw error;
    }

    if (!data || !data.exercises || !data.exercises.length) {
      console.log("No default exercises found");
      return [];
    }

    console.log(`Found ${data.exercises.length} default exercises`);

    await syncDefaultExercisesToLocal(data.exercises);
  } catch (err) {
    console.error("Unexpected error in pullDefaultExercises:", err);
    throw err;
  }
}

async function syncDefaultExercisesToLocal(defaultExercises: ServerExercise[]) {
  await database.write(async () => {
    const batchOps = await Promise.all(
      defaultExercises.flatMap(async (serverExercise) => {
        try {
          const existingExercise = await exercisesCollection
            .find(serverExercise.id)
            .catch(() => null);

          if (!existingExercise) {
            try {
              const exercise = exercisesCollection.prepareCreate((exercise) => {
                exercise._raw.id = serverExercise.id;
                exercise.title = serverExercise.title;
                exercise.description = serverExercise.description;
                exercise.muscleGroup = serverExercise.muscle_group;
                exercise.category = serverExercise.category;
                exercise.isDefault = true;
              });

              return exercise;
            } catch (error) {
              console.error(error);
            }
          } else if (
            new Date(serverExercise.updated_at) >
            new Date(existingExercise.updatedAt)
          ) {
            const exercise = existingExercise.prepareUpdate((exercise) => {
              exercise.title = serverExercise.title;
              exercise.description = serverExercise.description;
              exercise.muscleGroup = serverExercise.muscle_group;
              exercise.isDefault = true;
            });

            return exercise;
          }
        } catch (err) {
          console.error(`Error processing exercise ${serverExercise.id}:`, err);
        }
      })
    );

    await database.batch(...batchOps);
  });

  console.log("Default exercises sync completed");
}
