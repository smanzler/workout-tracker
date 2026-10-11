import type {
  ExerciseCategory,
  MuscleGroup,
  WorkoutExerciseInput,
  WorkoutSetInput,
} from "@rep/shared";
import { randomUUID } from "expo-crypto";

export type DraftExerciseInfo = {
  id: string;
  title: string;
  category: ExerciseCategory | null;
  muscleGroup: MuscleGroup | null;
};

/** Weight and reps are the text in their inputs. */
export type DraftSet = {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
};

export type DraftExercise = {
  id: string;
  exercise: DraftExerciseInfo;
  notes?: string;
  sets: DraftSet[];
};

/** The exercises of a workout or routine while the user edits them. */
export type Draft = DraftExercise[];

const toText = (value: number | null | undefined) => value?.toString() ?? "";

const createSet = (
  set: WorkoutSetInput = { weight: null, reps: null },
  completed = false,
): DraftSet => ({
  id: randomUUID(),
  weight: toText(set.weight),
  reps: toText(set.reps),
  completed,
});

const updateExercise = (
  draft: Draft,
  exerciseId: string,
  update: (exercise: DraftExercise) => DraftExercise,
) =>
  draft.map((exercise) =>
    exercise.id === exerciseId ? update(exercise) : exercise,
  );

const updateDraftSet = (
  draft: Draft,
  {
    exerciseId,
    setId,
    update,
  }: { exerciseId: string; setId: string; update: (set: DraftSet) => DraftSet },
) =>
  updateExercise(draft, exerciseId, (exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => (set.id === setId ? update(set) : set)),
  }));

/** An exercise of a saved routine or workout, as the API returns it. */
export type SavedExercise = {
  exerciseId: string;
  exercise: Omit<DraftExerciseInfo, "id">;
  notes?: string | null;
  sets: WorkoutSetInput[];
};

export const toDraft = (
  exercises: SavedExercise[],
  { completed }: { completed: boolean },
): Draft =>
  exercises.map(({ exerciseId, exercise, notes, sets }) => ({
    id: randomUUID(),
    exercise: { id: exerciseId, ...exercise },
    ...(notes && { notes }),
    sets: sets.map((set) => createSet(set, completed)),
  }));

/** Adds each exercise with one empty set. */
export const addExercises = (
  draft: Draft,
  exercises: DraftExerciseInfo[],
): Draft => [
  ...draft,
  ...exercises.map((exercise) => ({
    id: randomUUID(),
    exercise,
    sets: [createSet()],
  })),
];

export const removeExercise = (draft: Draft, exerciseId: string): Draft =>
  draft.filter(({ id }) => id !== exerciseId);

export const addSet = (draft: Draft, exerciseId: string): Draft =>
  updateExercise(draft, exerciseId, (exercise) => ({
    ...exercise,
    sets: [...exercise.sets, createSet()],
  }));

export const removeSet = (
  draft: Draft,
  { exerciseId, setId }: { exerciseId: string; setId: string },
): Draft =>
  updateExercise(draft, exerciseId, (exercise) => ({
    ...exercise,
    sets: exercise.sets.filter(({ id }) => id !== setId),
  }));

export const updateSet = (
  draft: Draft,
  {
    exerciseId,
    setId,
    values,
  }: {
    exerciseId: string;
    setId: string;
    values: Partial<Pick<DraftSet, "weight" | "reps">>;
  },
): Draft =>
  updateDraftSet(draft, {
    exerciseId,
    setId,
    update: (set) => ({ ...set, ...values }),
  });

/** Whether the set has reps, typed or suggested. Weight is optional. */
export const canCompleteSet = (set: DraftSet, suggestion?: WorkoutSetInput) =>
  set.reps.trim() !== "" || (suggestion?.reps ?? null) !== null;

/**
 * Marks a set done, or not done when it is done. Fills an empty weight or reps
 * from `suggestion`, which is what the inputs showed as placeholders.
 */
export const toggleSet = (
  draft: Draft,
  {
    exerciseId,
    setId,
    suggestion,
  }: { exerciseId: string; setId: string; suggestion?: WorkoutSetInput },
): Draft =>
  updateDraftSet(draft, {
    exerciseId,
    setId,
    update: (set) =>
      set.completed
        ? { ...set, completed: false }
        : {
            ...set,
            completed: true,
            weight: set.weight.trim() || toText(suggestion?.weight),
            reps: set.reps.trim() || toText(suggestion?.reps),
          },
  });

export const hasIncompleteSets = (draft: Draft) =>
  draft.some(({ sets }) => sets.some(({ completed }) => !completed));

/** Keeps the done sets, and removes each exercise that has none. */
export const keepCompletedSets = (draft: Draft): Draft =>
  draft
    .map((exercise) => ({
      ...exercise,
      sets: exercise.sets.filter(({ completed }) => completed),
    }))
    .filter(({ sets }) => sets.length > 0);

const parseAmount = (text: string) => {
  const value = Number(text.trim());
  return text.trim() === "" || !Number.isFinite(value) || value < 0
    ? null
    : value;
};

/** Turns the typed sets into numbers. Empty or invalid text becomes null. */
export const toSetInput = ({
  weight,
  reps,
}: Pick<DraftSet, "weight" | "reps">): WorkoutSetInput => {
  const parsedReps = parseAmount(reps);

  return {
    weight: parseAmount(weight),
    reps: parsedReps === null ? null : Math.trunc(parsedReps),
  };
};

export const toExerciseInputs = (draft: Draft): WorkoutExerciseInput[] =>
  draft.map(({ exercise, notes, sets }) => ({
    exerciseId: exercise.id,
    ...(notes && { notes }),
    sets: sets.map(toSetInput),
  }));
