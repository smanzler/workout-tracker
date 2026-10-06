import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export const useFollowCounts = (userId?: string) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.social.follows.counts.queryOptions(
      { userId: userId! },
      { enabled: !!userId },
    ),
  );
};
