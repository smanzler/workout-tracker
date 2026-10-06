import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteRoutine = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.activity.routine.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.activity.routine.getAll.queryFilter(),
        );
      },
    }),
  );
};
