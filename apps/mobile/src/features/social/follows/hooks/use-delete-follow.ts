import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteFollow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.social.follows.delete.mutationOptions({
      onSuccess: (_, { targetUserId }) => {
        queryClient.setQueryData(
          trpc.social.follows.get.queryKey({ targetUserId }),
          null,
        );
        queryClient.invalidateQueries(trpc.social.follows.counts.pathFilter());
        queryClient.invalidateQueries(trpc.social.feed.get.queryFilter());
      },
    }),
  );
};
