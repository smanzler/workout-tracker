import { router } from "../lib/trpc";
import { activityRouter } from "./activity";

export const appRouter = router({
  activity: activityRouter,
});

export type AppRouter = typeof appRouter;
