import {
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
