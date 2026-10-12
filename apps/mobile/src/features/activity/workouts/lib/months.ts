import { groupBy } from "../../lib/group-by";

/** "2026-10", in the same form as the month totals from the API. */
export const toMonthKey = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;

/** One section for each month, in the order of the workouts. */
export const groupByMonth = <TWorkout extends { startedAt: Date }>(
  workouts: TWorkout[],
) =>
  [...groupBy(workouts, ({ startedAt }) => toMonthKey(startedAt))].map(
    ([key, data]) => ({ key, startedAt: data[0].startedAt, data }),
  );
