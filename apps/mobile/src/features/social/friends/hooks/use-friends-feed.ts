import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export const useFriendsFeed = () => {
  const trpc = useTRPC();
  return useQuery(trpc.social.feed.get.queryOptions());
};
