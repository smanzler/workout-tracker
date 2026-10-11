import { router } from "../lib/trpc";
import { accountRouter } from "./account";
import { activityRouter } from "./activity";
import { notificationsRouter } from "./notifications";
import { socialRouter } from "./social";

export const appRouter = router({
  account: accountRouter,
  activity: activityRouter,
  social: socialRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
