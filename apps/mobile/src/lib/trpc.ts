import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@rep/api";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { authClient } from "./auth-client";
import { env } from "@/env";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

export function createLinks() {
  return [
    httpBatchLink({
      url: env.EXPO_PUBLIC_API_URL + "/trpc",
      transformer: superjson,
      async headers() {
        const cookies = await authClient.getCookie();
        return cookies ? { Cookie: cookies } : {};
      },
    }),
  ];
}

export const vanillaTrpc = createTRPCClient<AppRouter>({
  links: createLinks(),
});
