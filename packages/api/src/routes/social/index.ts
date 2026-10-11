import { router } from "../../lib/trpc";
import { feedRouter } from "./feed";
import { followsRouter } from "./follows";
import { kudosRouter } from "./kudos";
import { profileRouter } from "./profile";

export const socialRouter = router({
  profile: profileRouter,
  follows: followsRouter,
  feed: feedRouter,
  kudos: kudosRouter,
});
