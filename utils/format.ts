export function formatDuration(startTime: number, endTime: number): string {
  const durationInSeconds = Math.floor(
    ((endTime ?? startTime) - startTime) / 1000
  );

  if (durationInSeconds < 60) {
    return `${durationInSeconds}s`;
  }

  const minutes = Math.floor(durationInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  return `${minutes}m`;
}

export const chunkArray = (arr: Array<any>, size: number) => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
};
