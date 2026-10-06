import { authClient } from "@/lib/auth-client";

export const useAuth = () => {
  const { data: session, isPending } = authClient.useSession();

  return { user: session?.user, isLoading: isPending };
};
