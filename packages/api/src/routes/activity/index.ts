import { router } from "../../lib/trpc";
import { exerciseRouter } from "./exercise";
import { workoutRouter } from "./workout";

export const activityRouter = router({
  exercise: exerciseRouter,
  workout: workoutRouter,
});
