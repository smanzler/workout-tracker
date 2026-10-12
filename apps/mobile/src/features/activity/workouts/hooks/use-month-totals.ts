import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

/** The workout and record counts of each month, in the device's time zone. */
export const useMonthTotals = () => {
  const trpc = useTRPC();
  return useQuery(
    trpc.activity.workout.getMonthTotals.queryOptions({
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  );
};
