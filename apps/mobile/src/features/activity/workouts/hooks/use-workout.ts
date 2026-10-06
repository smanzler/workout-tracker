import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export const useWorkout = (id?: string) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.activity.workout.get.queryOptions({ id: id! }, { enabled: !!id }),
  );
};
