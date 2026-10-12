const pad = (value: number) => value.toString().padStart(2, "0");

/** A running timer: "4:05" or "1:04:05". */
export function formatTimer(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainder = totalSeconds % 60;

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(remainder)}`;
  return `${minutes}:${pad(remainder)}`;
}

/** A finished length of time: "45m" or "1h 5m". */
export function formatDuration(milliseconds: number) {
  const minutes = Math.max(0, Math.floor(milliseconds / 60_000));
  const hours = Math.floor(minutes / 60);

  if (hours === 0) return `${minutes}m`;
  return minutes % 60 === 0 ? `${hours}h` : `${hours}h ${minutes % 60}m`;
}

/** The length of a workout in milliseconds. */
export const getWorkoutLength = ({
  startedAt,
  endedAt,
}: {
  startedAt: Date;
  endedAt: Date;
}) => endedAt.getTime() - startedAt.getTime();
