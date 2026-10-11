import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateWorkout = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.activity.workout.create.mutationOptions({
      onSuccess: () => {
        // A new workout changes history, best sets and previous sets.
        queryClient.invalidateQueries(trpc.activity.workout.pathFilter());
        queryClient.invalidateQueries(trpc.activity.exercise.pathFilter());
      },
    }),
  );
};
