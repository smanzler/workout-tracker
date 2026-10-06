import { useTRPCClient } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";
import { getPushToken } from "../lib/push-token";

/** Stops push notifications to this device. Call it before signing out. */
export const useRemovePushToken = () => {
  const trpcClient = useTRPCClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getPushToken();
      if (token) {
        await trpcClient.notifications.pushTokens.remove.mutate({ token });
      }
    },
  });
};
