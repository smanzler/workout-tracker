import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export const useMyProfile = () => {
  const trpc = useTRPC();
  return useQuery(trpc.social.profile.get.queryOptions());
};
