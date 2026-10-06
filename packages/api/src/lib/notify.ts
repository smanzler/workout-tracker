import { eq } from "drizzle-orm";
import db from "../db";
import {
  NotificationDeliveries,
  Notifications,
  PushTokens,
} from "../db/schema";
import {
  notificationPayloadSchema,
  type NotificationPayload,
  type NotificationPayloadOf,
  type NotificationType,
} from "@rep/shared";
import { boss } from "./boss";

type RenderedNotification = { title: string; body: string };

const notificationRenderers: {
  [TType in NotificationType]: (
    payload: NotificationPayloadOf<TType>,
  ) => RenderedNotification;
} = {
  follow: ({ data }) => ({
    title: "New follower",
    body: `${data.followerName} followed you`,
  }),
  kudos: ({ data }) => ({
    title: "New kudos",
    body: `${data.giverName} gave kudos to ${data.workoutName}`,
  }),
};

const renderNotification = <TType extends NotificationType>(
  payload: NotificationPayloadOf<TType>,
) => notificationRenderers[payload.type](payload);

/**
 * Stores a notification and queues a push to each of the user's devices.
 * Returns null when a notification with the same dedupe key exists.
 */
export const notify = async ({
  userId,
  payload,
  dedupeKey,
}: {
  userId: string;
  payload: NotificationPayload;
  dedupeKey?: string;
}) => {
  const parsed = notificationPayloadSchema.parse(payload);
  const { title, body } = renderNotification(parsed);

  const [notification] = await db
    .insert(Notifications)
    .values({
      userId,
      type: parsed.type,
      data: parsed.data,
      title,
      body,
      dedupeKey,
    })
    .onConflictDoNothing({
      target: [Notifications.userId, Notifications.dedupeKey],
    })
    .returning();

  if (!notification) return null; // duplicate event — already notified, no-op

  const tokens = await db
    .select()
    .from(PushTokens)
    .where(eq(PushTokens.userId, userId));

  for (const { token: deviceToken } of tokens) {
    const [delivery] = await db
      .insert(NotificationDeliveries)
      .values({
        notificationId: notification.id,
        channel: "mobile",
        deviceToken,
      })
      .returning();

    if (!delivery) throw new Error("Error queueing notification delivery");

    await boss.send("notify.mobile", { deliveryId: delivery.id });
  }

  return notification;
};
