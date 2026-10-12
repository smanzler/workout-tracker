import { getTimeZone } from "@/lib/date";
import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

/** The local date of each workout of a user since `from`, newest first. */
export const useWorkoutDays = ({
  userId,
  from,
}: {
  userId: string;
  from: Date;
}) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.activity.workout.getDays.queryOptions({
      userId,
      timeZone: getTimeZone(),
      from: from.getTime(),
    }),
  );
};
