import fastify from "fastify";
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { authRoutes } from "./routes/auth";
import { env } from "./env";
import { appRouter, type AppRouter } from "./routes";
import { createContext } from "./lib/trpc";

// A batched tRPC call puts every procedure name in the URL path.
const server = fastify({ routerOptions: { maxParamLength: 5000 } });

server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`Error in tRPC handler on path '${path}':`, error);
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

server.register(authRoutes);

server.listen({ port: env.PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
