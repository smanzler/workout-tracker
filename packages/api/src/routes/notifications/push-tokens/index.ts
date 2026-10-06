import db from "../../../db/index";
import { PushTokens } from "../../../db/schema";
import { and, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../../../lib/trpc";
import { z } from "zod";

export const pushTokensRouter = router({
  register: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { token } = opts.input;

      await db
        .insert(PushTokens)
        .values({ userId: user.id, token })
        .onConflictDoUpdate({
          target: PushTokens.token,
          set: { userId: user.id },
        });

      return { token };
    }),

  // Call before signing out, so this device stops getting the user's pushes.
  remove: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { token } = opts.input;

      await db
        .delete(PushTokens)
        .where(
          and(eq(PushTokens.token, token), eq(PushTokens.userId, user.id)),
        );

      return { token };
    }),
});
