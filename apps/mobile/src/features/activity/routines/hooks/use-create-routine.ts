import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateRoutine = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.activity.routine.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.activity.routine.getAll.queryFilter(),
        );
      },
    }),
  );
};
