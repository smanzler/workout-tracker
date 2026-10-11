import { router } from "../../lib/trpc";
import { exerciseRouter } from "./exercise";
import { routineRouter } from "./routine";
import { workoutRouter } from "./workout";

export const activityRouter = router({
  exercise: exerciseRouter,
  routine: routineRouter,
  workout: workoutRouter,
});
