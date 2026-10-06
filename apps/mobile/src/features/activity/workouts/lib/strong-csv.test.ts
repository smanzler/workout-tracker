import { parseDuration, parseStrongCsv } from "./strong-csv";

const header =
  "Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE";

const minutes = 60_000;

describe("parseDuration", () => {
  it("adds up hours, minutes and seconds", () => {
    expect(parseDuration("1h 5m")).toBe(65 * minutes);
    expect(parseDuration("45m 10s")).toBe(45 * minutes + 10_000);
    expect(parseDuration("")).toBe(0);
    expect(parseDuration("soon")).toBe(0);
  });
});

describe("parseStrongCsv", () => {
  it("makes one workout per date and name, with its exercises and sets", () => {
    const csv = [
      header,
      "2024-01-15 18:30:00,Evening Workout,1h 5m,Bench Press (Barbell),1,135,8,0,0,,,",
      "2024-01-15 18:30:00,Evening Workout,1h 5m,Bench Press (Barbell),2,135,7.0,0,0,Pause reps,,",
      "2024-01-15 18:30:00,Evening Workout,1h 5m,Bench Press (Barbell),Rest Timer,0,0,0,90,,,",
      "2024-01-15 18:30:00,Evening Workout,1h 5m,Pull Up,1,,10,0,0,,,",
      "2024-01-17 07:00:00,Morning Workout,45m,Squat (Barbell),1,225,5,0,0,,,",
    ].join("\n");
    const evening = new Date(2024, 0, 15, 18, 30).getTime();
    const morning = new Date(2024, 0, 17, 7, 0).getTime();

    expect(parseStrongCsv(csv)).toEqual([
      {
        name: "Evening Workout",
        startedAt: evening,
        endedAt: evening + 65 * minutes,
        exercises: [
          {
            title: "Bench Press (Barbell)",
            notes: "Pause reps",
            sets: [
              { weight: 135, reps: 8 },
              { weight: 135, reps: 7 },
            ],
          },
          { title: "Pull Up", sets: [{ weight: null, reps: 10 }] },
        ],
      },
      {
        name: "Morning Workout",
        startedAt: morning,
        endedAt: morning + 45 * minutes,
        exercises: [
          { title: "Squat (Barbell)", sets: [{ weight: 225, reps: 5 }] },
        ],
      },
    ]);
  });

  it("skips rows without a valid date and reads files without notes", () => {
    const csv = [
      "Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps",
      "yesterday,Lost Workout,10m,Plank,1,,1",
      "2024-02-01 12:00:00,,30m,Plank,1,,1",
    ].join("\n");

    expect(parseStrongCsv(csv)).toEqual([
      {
        name: "Workout",
        startedAt: new Date(2024, 1, 1, 12, 0).getTime(),
        endedAt: new Date(2024, 1, 1, 12, 30).getTime(),
        exercises: [{ title: "Plank", sets: [{ weight: null, reps: 1 }] }],
      },
    ]);
  });

  it("returns nothing for a file with no workouts", () => {
    expect(parseStrongCsv(header)).toEqual([]);
    expect(parseStrongCsv("")).toEqual([]);
  });
});
