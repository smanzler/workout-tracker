import db from "../../../db/index";
import { Follows, Profiles } from "../../../db/schema";
import { and, count, eq } from "drizzle-orm";
import { notify } from "../../../lib/notify";
import { protectedProcedure, router } from "../../../lib/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const findFollow = async ({
  followerId,
  followeeId,
}: {
  followerId: string;
  followeeId: string;
}): Promise<typeof Follows.$inferSelect | null> => {
  const [follow] = await db
    .select()
    .from(Follows)
    .where(
      and(
        eq(Follows.followerId, followerId),
        eq(Follows.followeeId, followeeId),
      ),
    );

  return follow ?? null;
};

export const followsRouter = router({
  get: protectedProcedure
    .input(z.object({ targetUserId: z.uuid() }))
    .query(async (opts) => {
      const { user } = opts.ctx;
      const { targetUserId } = opts.input;

      return findFollow({ followerId: user.id, followeeId: targetUserId });
    }),

  counts: protectedProcedure
    .input(z.object({ userId: z.uuid() }))
    .query(async (opts) => {
      const { userId } = opts.input;

      const [followers] = await db
        .select({ count: count() })
        .from(Follows)
        .where(eq(Follows.followeeId, userId));

      const [following] = await db
        .select({ count: count() })
        .from(Follows)
        .where(eq(Follows.followerId, userId));

      return {
        followerCount: followers?.count ?? 0,
        followingCount: following?.count ?? 0,
      };
    }),

  create: protectedProcedure
    .input(z.object({ targetUserId: z.uuid() }))
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { targetUserId } = opts.input;

      if (targetUserId === user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't follow yourself",
        });
      }

      const [target] = await db
        .select({ id: Profiles.id })
        .from(Profiles)
        .where(eq(Profiles.id, targetUserId));

      if (!target) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      const [follow] = await db
        .insert(Follows)
        .values({ followerId: user.id, followeeId: targetUserId })
        .onConflictDoNothing()
        .returning();

      // Following someone twice keeps the first follow.
      if (!follow) {
        return findFollow({ followerId: user.id, followeeId: targetUserId });
      }

      // The follow references the follower's profile, so it exists.
      const [follower] = await db
        .select({ username: Profiles.username })
        .from(Profiles)
        .where(eq(Profiles.id, user.id));

      await notify({
        userId: targetUserId,
        payload: {
          type: "follow",
          data: { userId: user.id, followerName: follower?.username ?? "" },
        },
        dedupeKey: `follow:${user.id}:${targetUserId}`,
      });

      return follow;
    }),

  delete: protectedProcedure
    .input(z.object({ targetUserId: z.uuid() }))
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { targetUserId } = opts.input;

      await db
        .delete(Follows)
        .where(
          and(
            eq(Follows.followerId, user.id),
            eq(Follows.followeeId, targetUserId),
          ),
        );

      return { targetUserId };
    }),
});
