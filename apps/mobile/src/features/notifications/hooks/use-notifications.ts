import { useTRPC } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export const useNotifications = () => {
  const trpc = useTRPC();
  return useQuery(trpc.notifications.list.queryOptions());
};
