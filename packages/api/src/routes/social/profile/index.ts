import db from "../../../db/index";
import { Profiles } from "../../../db/schema";
import { usernameSchema } from "@rep/shared";
import { and, desc, eq, ilike, ne } from "drizzle-orm";
import { withAvatarUrl } from "./util";
import { isUniqueViolation } from "../../../lib/postgres";
import { protectedProcedure, router } from "../../../lib/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { avatarRouter } from "./avatar";

const usernameTaken = () =>
  new TRPCError({ code: "CONFLICT", message: "That username is taken" });

export const profileRouter = router({
  get: protectedProcedure.query(async (opts) => {
    const { user } = opts.ctx;

    const [profile] = await db
      .select()
      .from(Profiles)
      .where(eq(Profiles.id, user.id));

    if (!profile) {
      return null;
    }

    return withAvatarUrl(profile);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async (opts) => {
      const { id } = opts.input;

      const [profile] = await db
        .select()
        .from(Profiles)
        .where(eq(Profiles.id, id));

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      return withAvatarUrl(profile);
    }),

  search: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async (opts) => {
      const { user } = opts.ctx;
      const { search } = opts.input;

      const trimmed = search.trim();
      if (!trimmed) return [];

      const escaped = trimmed.replace(/[\\%_]/g, (c) => `\\${c}`);

      const profiles = await db
        .select()
        .from(Profiles)
        .where(
          and(
            ilike(Profiles.username, `%${escaped}%`),
            ne(Profiles.id, user.id),
          ),
        )
        .limit(20);

      return profiles.map((p) => withAvatarUrl(p));
    }),

  suggested: protectedProcedure.query(async (opts) => {
    const { user } = opts.ctx;

    const profiles = await db
      .select()
      .from(Profiles)
      .where(ne(Profiles.id, user.id))
      .orderBy(desc(Profiles.createdAt))
      .limit(20);

    return profiles.map((p) => withAvatarUrl(p));
  }),

  create: protectedProcedure
    .input(z.object({ username: usernameSchema }))
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { username } = opts.input;

      const [existingProfile] = await db
        .select()
        .from(Profiles)
        .where(eq(Profiles.id, user.id));

      if (existingProfile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Profile already exists",
        });
      }

      try {
        const [profile] = await db
          .insert(Profiles)
          .values({ id: user.id, username })
          .returning();

        if (!profile) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create profile",
          });
        }

        return withAvatarUrl(profile);
      } catch (error) {
        if (isUniqueViolation(error)) throw usernameTaken();
        throw error;
      }
    }),

  update: protectedProcedure
    .input(z.object({ username: usernameSchema }))
    .mutation(async (opts) => {
      const { user } = opts.ctx;
      const { username } = opts.input;

      try {
        const [profile] = await db
          .update(Profiles)
          .set({ username })
          .where(eq(Profiles.id, user.id))
          .returning();

        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Profile not found",
          });
        }

        return withAvatarUrl(profile);
      } catch (error) {
        if (isUniqueViolation(error)) throw usernameTaken();
        throw error;
      }
    }),

  avatar: avatarRouter,
});
