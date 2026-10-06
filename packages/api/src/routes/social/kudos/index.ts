import db from "../../../db/index";
import { Kudos, Profiles, Workouts } from "../../../db/schema";
import { and, eq } from "drizzle-orm";
import { notify } from "../../../lib/notify";
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
        .select({
          id: Workouts.id,
          name: Workouts.name,
          userId: Workouts.userId,
        })
        .from(Workouts)
        .where(eq(Workouts.id, workoutId));

      if (!workout) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [kudos] = await db
        .insert(Kudos)
        .values({ workoutId, userId: user.id })
        .onConflictDoNothing()
        .returning({ id: Kudos.id });

      if (kudos && workout.userId !== user.id) {
        const [giver] = await db
          .select({ username: Profiles.username })
          .from(Profiles)
          .where(eq(Profiles.id, user.id));

        // The dedupe key stops a second push after kudos are taken back and given again.
        await notify({
          userId: workout.userId,
          payload: {
            type: "kudos",
            data: {
              workoutId,
              workoutName: workout.name,
              giverName: giver?.username ?? "",
            },
          },
          dedupeKey: `kudos:${workoutId}:${user.id}`,
        });
      }

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
