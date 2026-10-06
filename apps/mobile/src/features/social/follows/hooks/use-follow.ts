import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export const useFollow = (targetUserId?: string) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.social.follows.get.queryOptions(
      { targetUserId: targetUserId! },
      { enabled: !!targetUserId },
    ),
  );
};
