import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateUsername = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.social.profile.update.mutationOptions({
      onSuccess: (profile) => {
        queryClient.setQueryData(trpc.social.profile.get.queryKey(), profile);
      },
    }),
  );
};
