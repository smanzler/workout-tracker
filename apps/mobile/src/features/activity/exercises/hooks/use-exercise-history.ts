import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export const useExerciseHistory = (exerciseId?: string) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.activity.exercise.history.queryOptions(
      { exerciseId: exerciseId! },
      { enabled: !!exerciseId },
    ),
  );
};
