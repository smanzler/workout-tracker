import {
  notificationPayloadSchema,
  type NotificationPayloadOf,
  type NotificationType,
} from "@rep/shared";
import { router, type Href } from "expo-router";

const notificationRoutes: {
  [TType in NotificationType]: (
    data: NotificationPayloadOf<TType>["data"],
  ) => Href;
} = {
  follow: ({ userId }) => ({
    pathname: "/profile",
    params: { profileId: userId },
  }),
  kudos: ({ workoutId }) => ({
    pathname: "/workout-details",
    params: { workoutId },
  }),
};

const toRoute = <TType extends NotificationType>({
  type,
  data,
}: {
  type: TType;
  data: NotificationPayloadOf<TType>["data"];
}) => notificationRoutes[type](data);

/** Opens the screen of a notification. It ignores a payload it cannot read. */
export const openNotification = (payload: unknown) => {
  const parsed = notificationPayloadSchema.safeParse(payload);
  if (parsed.success) router.push(toRoute(parsed.data));
};
