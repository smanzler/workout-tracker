const periods = [
  { until: 5, name: "Night Workout" },
  { until: 12, name: "Morning Workout" },
  { until: 17, name: "Afternoon Workout" },
  { until: 21, name: "Evening Workout" },
];

/** A name from the local time of day, such as "Morning Workout". */
export const defaultWorkoutName = (date: Date) =>
  periods.find(({ until }) => date.getHours() < until)?.name ?? "Night Workout";
