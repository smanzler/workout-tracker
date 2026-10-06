import { router } from "../../lib/trpc";
import { profileRouter } from "./profile";

export const socialRouter = router({
  profile: profileRouter,
});
