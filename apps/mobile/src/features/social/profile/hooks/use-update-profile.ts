import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadAvatar } from "../lib/avatar";
import { useTRPC, useTRPCClient } from "@/lib/trpc";

export const useUpdateProfile = () => {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ avatar }: { avatar: string | null }) =>
      avatar
        ? uploadAvatar(trpcClient, avatar)
        : trpcClient.social.profile.avatar.remove.mutate(),
    onSuccess: (profile) => {
      queryClient.setQueryData(trpc.social.profile.get.queryKey(), profile);
    },
  });
};
