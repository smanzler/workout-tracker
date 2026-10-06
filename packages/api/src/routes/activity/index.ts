import { router } from "../../lib/trpc";
import { workoutRouter } from "./workout";

export const activityRouter = router({
  workout: workoutRouter,
});
