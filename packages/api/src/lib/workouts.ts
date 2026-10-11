/** Relational query config for a workout's exercises and their sets, in order. */
export const workoutExercisesQuery = {
  orderBy: { position: "asc" },
  columns: { id: true, exerciseId: true, notes: true },
  with: {
    exercise: {
      columns: { title: true, category: true, muscleGroup: true },
    },
    sets: {
      orderBy: { position: "asc" },
      columns: {
        id: true,
        weight: true,
        reps: true,
        isWeightPr: true,
        isVolumePr: true,
        isOneRepMaxPr: true,
      },
    },
  },
} as const;
