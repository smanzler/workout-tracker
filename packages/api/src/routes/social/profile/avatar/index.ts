import db from "../../../../db/index";
import { Profiles } from "../../../../db/schema";
import { s3 } from "../../../../lib/s3";
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq } from "drizzle-orm";
import { withAvatarUrl } from "../util";
import { env } from "../../../../env";
import { protectedProcedure, router } from "../../../../lib/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const avatarRouter = router({
  upload: protectedProcedure.mutation(async (opts) => {
    const { user } = opts.ctx;

    const [existingProfile] = await db
      .select()
      .from(Profiles)
      .where(eq(Profiles.id, user.id));

    if (!existingProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Profile not found",
      });
    }

    const uploadKey = `uploads/${user.id}/${crypto.randomUUID()}.jpg`;

    const command = new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: uploadKey,
      ContentType: "image/jpeg",
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 5,
    });

    return { uploadUrl, uploadKey };
  }),

  complete: protectedProcedure
    .input(z.object({ uploadKey: z.string() }))
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { uploadKey } = opts.input;

      if (!uploadKey.startsWith(`uploads/${user.id}/`)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown upload" });
      }

      await s3.send(
        new HeadObjectCommand({
          Bucket: env.BUCKET_NAME,
          Key: uploadKey,
        }),
      );

      const [existingProfile] = await db
        .select()
        .from(Profiles)
        .where(eq(Profiles.id, user.id));

      if (!existingProfile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      const [profile] = await db
        .update(Profiles)
        .set({ avatarKey: uploadKey })
        .where(eq(Profiles.id, user.id))
        .returning();

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      return withAvatarUrl(profile);
    }),

  remove: protectedProcedure.mutation(async (opts) => {
    const { user } = opts.ctx;

    const [profile] = await db
      .update(Profiles)
      .set({ avatarKey: null })
      .where(eq(Profiles.id, user.id))
      .returning();

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Profile not found",
      });
    }

    return withAvatarUrl(profile);
  }),
});
