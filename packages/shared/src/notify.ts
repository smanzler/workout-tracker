import { z } from "zod";

export const followNotificationSchema = z.object({
  type: z.literal("follow"),
  data: z.object({
    userId: z.uuid(),
    followerName: z.string(),
  }),
});

export const kudosNotificationSchema = z.object({
  type: z.literal("kudos"),
  data: z.object({
    workoutId: z.uuid(),
    workoutName: z.string(),
    giverName: z.string(),
  }),
});

export const notificationPayloadSchema = z.discriminatedUnion("type", [
  followNotificationSchema,
  kudosNotificationSchema,
]);

export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;

export type NotificationType = NotificationPayload["type"];

export type NotificationPayloadOf<TType extends NotificationType> = Extract<
  NotificationPayload,
  { type: TType }
>;
