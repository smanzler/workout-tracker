import { useEffect, useState } from "react";

/** Seconds since `startedAt`, updated every second. */
export const useElapsedSeconds = (startedAt: number | null) => {
  const [now, setNow] = useState(() => Date.now());

  // JS timers stop in the background, so count from the start time.
  useEffect(() => {
    if (startedAt === null) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return startedAt === null ? 0 : Math.max(0, (now - startedAt) / 1000);
};
