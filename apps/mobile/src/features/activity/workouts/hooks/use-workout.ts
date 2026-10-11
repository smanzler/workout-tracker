import { useTRPC } from "@/lib/trpc";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/** One workout. It starts from the loaded history when it is there. */
export const useWorkout = (id?: string) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useQuery(
    trpc.activity.workout.get.queryOptions(
      { id: id! },
      {
        enabled: !!id,
        initialData: () =>
          queryClient
            .getQueryData(trpc.activity.workout.getAll.infiniteQueryKey({}))
            ?.pages.flatMap(({ items }) => items)
            .find((workout) => workout.id === id),
      },
    ),
  );
};
