import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useTRPCClient } from "@/lib/trpc";

export const useDeleteAccount = () => {
  const trpcClient = useTRPCClient();

  return useMutation({
    mutationFn: () => trpcClient.account.delete.mutate(),
    onSuccess: () => authClient.signOut(),
  });
};
