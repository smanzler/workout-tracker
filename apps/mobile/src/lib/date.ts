const dayInMilliseconds = 24 * 60 * 60 * 1000;

/** "Today", "Yesterday", "3 days ago", then a date such as "Mar 4". */
export function formatDate(date: Date, now = new Date()) {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const days = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / dayInMilliseconds,
  );

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) return `${days} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

/** "6:30 PM". */
export const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

/** "SUN", "11" and "OCT", for a column that shows a day. */
export const toDayParts = (date: Date) => ({
  weekday: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
  day: date.toLocaleDateString("en-US", { day: "2-digit" }),
  month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
});
