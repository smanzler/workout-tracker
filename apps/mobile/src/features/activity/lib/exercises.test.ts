import { filterExercises, groupByFirstLetter } from "./exercises";

const exercises = [
  { title: "Squat (Barbell)" },
  { title: "bench press (Dumbbell)" },
  { title: "Bench Press (Barbell)" },
  { title: "Deadlift (Barbell)" },
];

describe("filterExercises", () => {
  it("matches every word in any order, ignoring case", () => {
    expect(filterExercises(exercises, "barbell BENCH")).toEqual([
      { title: "Bench Press (Barbell)" },
    ]);
  });

  it("keeps everything for an empty search", () => {
    expect(filterExercises(exercises, "  ")).toHaveLength(4);
  });
});

describe("groupByFirstLetter", () => {
  it("groups by the upper-case first letter in alphabetical order", () => {
    expect(groupByFirstLetter(exercises)).toEqual([
      {
        title: "B",
        data: [
          { title: "Bench Press (Barbell)" },
          { title: "bench press (Dumbbell)" },
        ],
      },
      { title: "D", data: [{ title: "Deadlift (Barbell)" }] },
      { title: "S", data: [{ title: "Squat (Barbell)" }] },
    ]);
  });
});
