import db from "../../../db/index";
import { Kudos, Workouts } from "../../../db/schema";
import { and, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../../../lib/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const kudosRouter = router({
  create: protectedProcedure
    .input(z.object({ workoutId: z.uuid() }))
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { workoutId } = opts.input;

      const [workout] = await db
        .select({ id: Workouts.id })
        .from(Workouts)
        .where(eq(Workouts.id, workoutId));

      if (!workout) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db
        .insert(Kudos)
        .values({ workoutId, userId: user.id })
        .onConflictDoNothing();

      return { workoutId };
    }),

  delete: protectedProcedure
    .input(z.object({ workoutId: z.uuid() }))
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { workoutId } = opts.input;

      await db
        .delete(Kudos)
        .where(and(eq(Kudos.workoutId, workoutId), eq(Kudos.userId, user.id)));

      return { workoutId };
    }),
});
