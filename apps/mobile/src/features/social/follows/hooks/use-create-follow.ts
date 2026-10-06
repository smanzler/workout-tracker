import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateFollow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.social.follows.create.mutationOptions({
      onSuccess: (follow, { targetUserId }) => {
        queryClient.setQueryData(
          trpc.social.follows.get.queryKey({ targetUserId }),
          follow,
        );
        queryClient.invalidateQueries(trpc.social.follows.counts.pathFilter());
        queryClient.invalidateQueries(trpc.social.feed.get.queryFilter());
      },
    }),
  );
};
