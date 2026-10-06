import { useTRPC } from "@/lib/trpc";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/** One routine. It starts from the routine list when the list is loaded. */
export const useRoutine = (id?: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useQuery(
    trpc.activity.routine.get.queryOptions(
      { id: id! },
      {
        enabled: !!id,
        initialData: () =>
          queryClient
            .getQueryData(trpc.activity.routine.getAll.queryKey())
            ?.find((routine) => routine.id === id),
      },
    ),
  );
};
