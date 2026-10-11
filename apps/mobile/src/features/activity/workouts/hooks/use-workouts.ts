import { useTRPC } from "@/lib/trpc";
import { useInfiniteQuery } from "@tanstack/react-query";

/** The user's workouts, newest first, a page at a time. */
export const useWorkouts = () => {
  const trpc = useTRPC();
  return useInfiniteQuery(
    trpc.activity.workout.getAll.infiniteQueryOptions(
      {},
      { getNextPageParam: ({ nextCursor }) => nextCursor },
    ),
  );
};
