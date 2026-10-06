import { router } from "../lib/trpc";
import { activityRouter } from "./activity";
import { notificationsRouter } from "./notifications";
import { socialRouter } from "./social";

export const appRouter = router({
  activity: activityRouter,
  social: socialRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
