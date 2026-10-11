import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export const useRoutines = () => {
  const trpc = useTRPC();
  return useQuery(trpc.activity.routine.getAll.queryOptions());
};
