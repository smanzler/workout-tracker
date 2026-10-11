import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateWorkout = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.activity.workout.update.mutationOptions({
      onSuccess: () => {
        // A changed workout can change the records of other workouts.
        queryClient.invalidateQueries(trpc.activity.workout.pathFilter());
        queryClient.invalidateQueries(trpc.activity.exercise.pathFilter());
      },
    }),
  );
};
