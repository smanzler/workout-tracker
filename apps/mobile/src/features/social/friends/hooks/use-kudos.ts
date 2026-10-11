import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useGiveKudos = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.social.kudos.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.social.feed.get.queryFilter());
      },
    }),
  );
};

export const useRemoveKudos = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.social.kudos.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.social.feed.get.queryFilter());
      },
    }),
  );
};
