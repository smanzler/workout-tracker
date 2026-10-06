import { router } from "../lib/trpc";
import { activityRouter } from "./activity";
import { socialRouter } from "./social";

export const appRouter = router({
  activity: activityRouter,
  social: socialRouter,
});

export type AppRouter = typeof appRouter;
