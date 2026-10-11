import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateExercise = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.activity.exercise.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.activity.exercise.getAll.queryFilter(),
        );
      },
    }),
  );
};
