import { useTRPC, useTRPCClient } from "@/lib/trpc";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { uploadAvatar } from "../lib/avatar";

export const useCreateProfile = () => {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      username,
      avatar,
    }: {
      username: string;
      avatar?: string;
    }) => {
      const profile = await trpcClient.social.profile.create.mutate({
        username,
      });

      if (!avatar) return { profile, avatarError: null };

      try {
        return {
          profile: await uploadAvatar(trpcClient, avatar),
          avatarError: null,
        };
      } catch (error) {
        return { profile, avatarError: error as Error };
      }
    },
    onSuccess: ({ profile }) => {
      queryClient.setQueryData(trpc.social.profile.get.queryKey(), profile);
    },
  });
};
