import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

/** The sets from the last workout with this exercise. */
export const usePreviousSets = (exerciseId: string) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.activity.exercise.previousSets.queryOptions({ exerciseId }),
  );
};
