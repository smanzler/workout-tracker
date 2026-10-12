import {
  addExercises,
  addSet,
  buildDraftStats,
  canCompleteSet,
  findCurrentSet,
  hasIncompleteSets,
  keepCompletedSets,
  removeExercise,
  removeSet,
  toDraft,
  toExerciseInputs,
  toggleSet,
  updateSet,
  type Draft,
  type DraftExerciseInfo,
  type SavedExercise,
} from "./draft";

jest.mock("expo-crypto", () => {
  let count = 0;
  return { randomUUID: () => `id-${(count += 1)}` };
});

const saved = (
  { id, ...exercise }: DraftExerciseInfo,
  sets: SavedExercise["sets"],
  notes?: string,
): SavedExercise => ({ exerciseId: id, exercise, notes, sets });

const bench: DraftExerciseInfo = {
  id: "bench",
  title: "Bench Press (Barbell)",
  category: "barbell",
  muscleGroup: "chest",
};

const squat: DraftExerciseInfo = {
  id: "squat",
  title: "Squat (Barbell)",
  category: "barbell",
  muscleGroup: "legs",
};

const firstSet = (draft: Draft) => {
  const [exercise] = draft;
  const [set] = exercise?.sets ?? [];
  if (!exercise || !set) throw new Error("empty draft");
  return { exerciseId: exercise.id, setId: set.id, set };
};

describe("addExercises", () => {
  it("adds each exercise with one empty set", () => {
    const draft = addExercises([], [bench, squat]);

    expect(draft.map(({ exercise }) => exercise.title)).toEqual([
      "Bench Press (Barbell)",
      "Squat (Barbell)",
    ]);
    expect(draft[0]?.sets).toEqual([
      { id: expect.any(String), weight: "", reps: "", completed: false },
    ]);
  });
});

describe("removeExercise", () => {
  it("removes only that exercise", () => {
    const draft = addExercises([], [bench, squat]);
    const remaining = removeExercise(draft, draft[0]?.id ?? "");

    expect(remaining.map(({ exercise }) => exercise.id)).toEqual(["squat"]);
  });
});

describe("addSet and removeSet", () => {
  it("adds an empty set to the end and removes a set by id", () => {
    const draft = addExercises([], [bench]);
    const { exerciseId, setId } = firstSet(draft);

    const withTwo = addSet(draft, exerciseId);
    expect(withTwo[0]?.sets).toHaveLength(2);

    const withOne = removeSet(withTwo, { exerciseId, setId });
    expect(withOne[0]?.sets.map(({ id }) => id)).not.toContain(setId);
  });
});

describe("updateSet", () => {
  it("changes only the given fields", () => {
    const draft = addExercises([], [bench]);
    const { exerciseId, setId } = firstSet(draft);

    const updated = updateSet(draft, {
      exerciseId,
      setId,
      values: { weight: "135" },
    });

    expect(firstSet(updated).set).toMatchObject({ weight: "135", reps: "" });
  });
});

describe("canCompleteSet", () => {
  const set = { id: "s", weight: "", reps: "", completed: false };

  it("needs reps, typed or suggested", () => {
    expect(canCompleteSet(set)).toBe(false);
    expect(canCompleteSet({ ...set, reps: "8" })).toBe(true);
    expect(canCompleteSet(set, { weight: 100, reps: 5 })).toBe(true);
    expect(canCompleteSet(set, { weight: 100, reps: null })).toBe(false);
  });
});

describe("toggleSet", () => {
  it("fills empty fields from the suggestion when completing", () => {
    const draft = addExercises([], [bench]);
    const { exerciseId, setId } = firstSet(draft);

    const toggled = toggleSet(draft, {
      exerciseId,
      setId,
      suggestion: { weight: 135, reps: 8 },
    });

    expect(firstSet(toggled).set).toMatchObject({
      weight: "135",
      reps: "8",
      completed: true,
    });
  });

  it("keeps typed values over the suggestion", () => {
    const base = addExercises([], [bench]);
    const { exerciseId, setId } = firstSet(base);
    const draft = updateSet(base, {
      exerciseId,
      setId,
      values: { weight: "145", reps: "6" },
    });

    const toggled = toggleSet(draft, {
      exerciseId,
      setId,
      suggestion: { weight: 135, reps: 8 },
    });

    expect(firstSet(toggled).set).toMatchObject({ weight: "145", reps: "6" });
  });

  it("marks a done set not done and keeps its values", () => {
    const draft = toDraft([saved(bench, [{ weight: 100, reps: 5 }])], {
      completed: true,
    });
    const { exerciseId, setId } = firstSet(draft);

    expect(firstSet(toggleSet(draft, { exerciseId, setId })).set).toMatchObject(
      { weight: "100", reps: "5", completed: false },
    );
  });
});

describe("hasIncompleteSets", () => {
  it("is true while any set is not done", () => {
    const draft = toDraft([saved(bench, [{ weight: 100, reps: 5 }])], {
      completed: true,
    });

    expect(hasIncompleteSets(draft)).toBe(false);
    expect(hasIncompleteSets(addSet(draft, draft[0]?.id ?? ""))).toBe(true);
  });
});

describe("keepCompletedSets", () => {
  it("removes the sets that are not done and the exercises left empty", () => {
    const draft = toDraft(
      [
        saved(bench, [
          { weight: 100, reps: 5 },
          { weight: 100, reps: 5 },
        ]),
        saved(squat, [{ weight: 200, reps: 3 }]),
      ],
      { completed: false },
    );
    const { exerciseId, setId } = firstSet(draft);
    const done = toggleSet(draft, { exerciseId, setId });

    const kept = keepCompletedSets(done);

    expect(kept.map(({ exercise }) => exercise.id)).toEqual(["bench"]);
    expect(kept[0]?.sets.map(({ id }) => id)).toEqual([setId]);
  });
});

describe("toExerciseInputs", () => {
  it("parses the typed text and turns empty or invalid text into null", () => {
    const draft = toDraft([saved(bench, [{ weight: null, reps: null }])], {
      completed: false,
    });
    const { exerciseId, setId } = firstSet(draft);
    const values = [
      { weight: "137.5", reps: "8" },
      { weight: "", reps: "abc" },
      { weight: "-5", reps: "7.9" },
    ];

    const inputs = values.map((value) =>
      toExerciseInputs(updateSet(draft, { exerciseId, setId, values: value })),
    );

    expect(inputs.map((input) => input[0]?.sets[0])).toEqual([
      { weight: 137.5, reps: 8 },
      { weight: null, reps: null },
      { weight: null, reps: 7 },
    ]);
    expect(inputs[0]?.[0]?.exerciseId).toBe("bench");
  });
});

describe("toDraft and toExerciseInputs", () => {
  it("keep the notes of an exercise", () => {
    const draft = toDraft([saved(bench, [{ weight: 100, reps: 5 }], "Pause")], {
      completed: true,
    });

    expect(draft[0]?.exercise).toEqual(bench);
    expect(toExerciseInputs(draft)).toEqual([
      { exerciseId: "bench", notes: "Pause", sets: [{ weight: 100, reps: 5 }] },
    ]);
  });
});

describe("findCurrentSet", () => {
  it("finds the first set that is not done, across exercises", () => {
    const draft = [
      ...toDraft([saved(bench, [{ weight: 100, reps: 5 }])], {
        completed: true,
      }),
      ...toDraft(
        [
          saved(squat, [
            { weight: 200, reps: 5 },
            { weight: 200, reps: 5 },
          ]),
        ],
        { completed: false },
      ),
    ];

    expect(findCurrentSet(draft)).toBe(draft[1]?.sets[0]);
  });

  it("returns undefined when every set is done", () => {
    const draft = toDraft([saved(bench, [{ weight: 100, reps: 5 }])], {
      completed: true,
    });

    expect(findCurrentSet(draft)).toBeUndefined();
  });
});

describe("buildDraftStats", () => {
  it("counts all sets and adds up the volume of the done sets", () => {
    const draft = [
      ...toDraft(
        [
          saved(bench, [
            { weight: 135, reps: 8 },
            { weight: null, reps: 10 },
          ]),
        ],
        { completed: true },
      ),
      ...toDraft([saved(squat, [{ weight: 200, reps: 5 }])], {
        completed: false,
      }),
    ];

    expect(buildDraftStats(draft)).toEqual({
      totalSets: 3,
      completedSets: 2,
      volume: 1080,
    });
  });
});
