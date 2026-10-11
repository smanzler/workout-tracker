import db from "../../../db/index";
import { Follows, Kudos, Profiles } from "../../../db/schema";
import { eq, sql } from "drizzle-orm";
import { withAvatarUrl } from "../profile/util";
import { workoutExercisesQuery } from "../../../lib/workouts";
import { protectedProcedure, router } from "../../../lib/trpc";

export const feedRouter = router({
  get: protectedProcedure.query(async (opts) => {
    const { user } = opts.ctx;

    const followees = await db
      .select({
        id: Profiles.id,
        username: Profiles.username,
        avatarKey: Profiles.avatarKey,
      })
      .from(Follows)
      .innerJoin(Profiles, eq(Profiles.id, Follows.followeeId))
      .where(eq(Follows.followerId, user.id));

    if (followees.length === 0) return [];

    const profileById = new Map(
      followees.map((profile) => [profile.id, withAvatarUrl(profile)]),
    );

    const workouts = await db.query.Workouts.findMany({
      where: { userId: { in: [...profileById.keys()] } },
      orderBy: { startedAt: "desc" },
      limit: 30,
      extras: {
        kudosCount: (t) =>
          sql<number>`(select count(*) from ${Kudos} where ${Kudos.workoutId} = ${t.id})`.mapWith(
            Number,
          ),
        hasGivenKudos: (t) =>
          sql<boolean>`exists (select 1 from ${Kudos} where ${Kudos.workoutId} = ${t.id} and ${Kudos.userId} = ${user.id})`.mapWith(
            Boolean,
          ),
      },
      with: { exercises: workoutExercisesQuery },
    });

    return workouts.flatMap((workout) => {
      const profile = profileById.get(workout.userId);
      return profile ? [{ ...workout, profile }] : [];
    });
  }),
});
