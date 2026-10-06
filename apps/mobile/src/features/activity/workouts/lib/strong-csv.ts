import type { ImportWorkoutsInput, WorkoutSetInput } from "@rep/shared";
import Papa from "papaparse";
import { z } from "zod";
import { groupBy } from "../../lib/group-by";

const cellSchema = z.string().trim().catch("");

const strongRowSchema = z.object({
  Date: cellSchema,
  Duration: cellSchema,
  "Exercise Name": cellSchema,
  Notes: cellSchema,
  Reps: cellSchema,
  "Set Order": cellSchema,
  Weight: cellSchema,
  "Workout Name": cellSchema,
});

type StrongRow = z.infer<typeof strongRowSchema>;

type ImportedWorkout = ImportWorkoutsInput["workouts"][number];

/** Strong writes local times as "2024-01-15 18:30:00". */
const parseDate = (text: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(
    text,
  );
  if (!match) return null;

  const [, year, month, day, hours, minutes, seconds] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds ?? 0),
  );
};

const durationUnits: Record<string, number> = {
  h: 3_600_000,
  m: 60_000,
  s: 1_000,
};

/** "1h 5m" or "45m 10s" in milliseconds. */
export const parseDuration = (text: string) =>
  text.split(/\s+/).reduce((total, part) => {
    const [, amount, unit] = /^(\d+)([hms])$/.exec(part) ?? [];
    return total + Number(amount ?? 0) * (durationUnits[unit ?? ""] ?? 0);
  }, 0);

const parseAmount = (text: string) => {
  const value = Number.parseFloat(text);
  return Number.isFinite(value) && value >= 0 ? value : null;
};

const toSet = ({ Weight, Reps }: StrongRow): WorkoutSetInput => {
  const reps = parseAmount(Reps);
  return {
    weight: parseAmount(Weight),
    reps: reps === null ? null : Math.round(reps),
  };
};

const toExercise = (rows: StrongRow[]) => {
  const title = rows[0]?.["Exercise Name"].slice(0, 100);
  const notes = rows
    .map((row) => row.Notes)
    .find(Boolean)
    ?.slice(0, 1000);

  return title
    ? [{ title, ...(notes && { notes }), sets: rows.map(toSet) }]
    : [];
};

const toWorkout = (rows: StrongRow[]): ImportedWorkout[] => {
  const [first] = rows;
  const startedAt = first && parseDate(first.Date);
  if (!first || !startedAt) return [];

  const setRows = rows.filter((row) => row["Set Order"] !== "Rest Timer");
  const exercises = [
    ...groupBy(setRows, (row) => row["Exercise Name"]).values(),
  ].flatMap(toExercise);
  if (exercises.length === 0) return [];

  return [
    {
      name: first["Workout Name"].slice(0, 100) || "Workout",
      startedAt: startedAt.getTime(),
      endedAt: startedAt.getTime() + parseDuration(first.Duration),
      exercises,
    },
  ];
};

/**
 * Reads a CSV export from the Strong app. Rows with the same date and
 * workout name make one workout, in the order of the file.
 */
export const parseStrongCsv = (csv: string): ImportedWorkout[] => {
  const rows = Papa.parse<unknown>(csv, {
    header: true,
    skipEmptyLines: true,
  })
    .data.map((record) => strongRowSchema.parse(record))
    .filter((row) => row.Date && row["Exercise Name"]);

  return [
    ...groupBy(rows, (row) => `${row.Date}|${row["Workout Name"]}`).values(),
  ].flatMap(toWorkout);
};
