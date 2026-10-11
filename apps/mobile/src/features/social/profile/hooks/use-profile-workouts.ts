import { useTRPC } from "@/lib/trpc";
import { useInfiniteQuery } from "@tanstack/react-query";

/** One person's workouts, newest first, a page at a time. */
export const useProfileWorkouts = (userId?: string) => {
  const trpc = useTRPC();
  return useInfiniteQuery(
    trpc.activity.workout.getAllByUserId.infiniteQueryOptions(
      { userId: userId! },
      {
        enabled: !!userId,
        getNextPageParam: ({ nextCursor }) => nextCursor,
      },
    ),
  );
};
