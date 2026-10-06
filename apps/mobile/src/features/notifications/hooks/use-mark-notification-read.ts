import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useMarkNotificationRead = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.notifications.markRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.notifications.list.queryFilter());
      },
    }),
  );
};
