import {
  buildExerciseSections,
  filterExercises,
  groupByFirstLetter,
  type ExerciseFilter,
} from "./exercises";

const exercises = [
  { title: "Squat (Barbell)", muscleGroup: "legs", category: "barbell" },
  {
    title: "bench press (Dumbbell)",
    muscleGroup: "chest",
    category: "dumbbell",
  },
  { title: "Bench Press (Barbell)", muscleGroup: "chest", category: "barbell" },
  { title: "Deadlift (Barbell)", muscleGroup: "back", category: "barbell" },
  { title: "Plank", muscleGroup: null, category: null },
] satisfies Parameters<typeof filterExercises>[0];

const noFilter: ExerciseFilter = {
  search: "",
  muscleGroup: null,
  category: null,
};

const titles = (list: { title: string }[]) => list.map(({ title }) => title);

describe("filterExercises", () => {
  it("matches every word in any order, ignoring case", () => {
    expect(
      titles(
        filterExercises(exercises, { ...noFilter, search: "barbell BENCH" }),
      ),
    ).toEqual(["Bench Press (Barbell)"]);
  });

  it("keeps everything for an empty filter", () => {
    expect(
      filterExercises(exercises, { ...noFilter, search: "  " }),
    ).toHaveLength(5);
  });

  it("keeps the muscle group and the category that the filter sets", () => {
    expect(
      titles(filterExercises(exercises, { ...noFilter, muscleGroup: "chest" })),
    ).toEqual(["bench press (Dumbbell)", "Bench Press (Barbell)"]);
    expect(
      titles(
        filterExercises(exercises, {
          search: "press",
          muscleGroup: "chest",
          category: "barbell",
        }),
      ),
    ).toEqual(["Bench Press (Barbell)"]);
  });
});

describe("groupByFirstLetter", () => {
  it("groups by the upper-case first letter in alphabetical order", () => {
    expect(
      groupByFirstLetter(exercises).map(({ title, data }) => [
        title,
        titles(data),
      ]),
    ).toEqual([
      ["B", ["Bench Press (Barbell)", "bench press (Dumbbell)"]],
      ["D", ["Deadlift (Barbell)"]],
      ["P", ["Plank"]],
      ["S", ["Squat (Barbell)"]],
    ]);
  });
});

describe("buildExerciseSections", () => {
  const now = new Date(2026, 9, 11);
  const dated = [
    { ...exercises[0], lastPerformedAt: new Date(2026, 9, 9) },
    { ...exercises[2], lastPerformedAt: new Date(2026, 9, 10) },
    { ...exercises[3], lastPerformedAt: new Date(2026, 8, 1) },
    { ...exercises[4], lastPerformedAt: null },
  ];
  const sectionTitles = (filter: ExerciseFilter) =>
    buildExerciseSections(dated, filter, now).map(({ title, data }) => [
      title,
      titles(data),
    ]);

  it("puts the exercises of the last two weeks first, newest first", () => {
    expect(sectionTitles(noFilter)[0]).toEqual([
      "RECENT",
      ["Bench Press (Barbell)", "Squat (Barbell)"],
    ]);
  });

  it("leaves out the recent section while a filter is set", () => {
    expect(sectionTitles({ ...noFilter, search: "squat" })).toEqual([
      ["S", ["Squat (Barbell)"]],
    ]);
  });
});
