import { useTRPC } from "@/lib/trpc";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

/**
 * Profiles whose username matches. It keeps the last results while it loads
 * new ones.
 */
export const useProfiles = (
  filters: { search: string },
  options?: { enabled?: boolean },
) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.social.profile.search.queryOptions(filters),
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
};

export const useSuggestedProfiles = (options?: { enabled?: boolean }) => {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.social.profile.suggested.queryOptions(),
    enabled: options?.enabled,
  });
};
