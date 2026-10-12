/** "2026-10-04", in the same form as the workout days from the API. */
export const toDayKey = (date: Date) =>
  [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0"),
  ].join("-");

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** The days of the last `count` weeks, oldest first. A week starts on Monday. */
export const listWeeks = (now: Date, count: number) => {
  const thisMonday = addDays(now, -((now.getDay() + 6) % 7));
  const firstMonday = addDays(thisMonday, -7 * (count - 1));

  return Array.from({ length: count }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(firstMonday, week * 7 + day)),
  );
};

/**
 * The number of weeks in a row that have a workout. The streak continues
 * while this week has none yet.
 */
export const countWeekStreak = (weeks: Date[][], days: Set<string>) => {
  const active = weeks.map((week) =>
    week.some((day) => days.has(toDayKey(day))),
  );
  if (!active.at(-1)) active.pop();

  return active.length - 1 - active.lastIndexOf(false);
};
