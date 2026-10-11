import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export const useProfile = (id?: string) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.social.profile.getById.queryOptions({ id: id! }, { enabled: !!id }),
  );
};
