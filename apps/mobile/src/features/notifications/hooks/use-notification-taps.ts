import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { openNotification } from "../lib/notification-routes";
import { useMarkNotificationRead } from "./use-mark-notification-read";

const pushDataSchema = z.object({ notificationId: z.uuid() });

/**
 * Opens the screen of a push notification that the user taps, and marks it
 * read.
 */
export const useNotificationTaps = () => {
  const response = Notifications.useLastNotificationResponse();
  const { mutate: markRead } = useMarkNotificationRead();
  // The last response stays the same when this hook mounts again.
  const handledIds = useRef(new Set<string>());

  useEffect(() => {
    if (!response) return;

    const { identifier, content } = response.notification.request;
    if (handledIds.current.has(identifier)) return;
    handledIds.current.add(identifier);

    const parsed = pushDataSchema.safeParse(content.data);
    if (parsed.success)
      markRead({ notificationId: parsed.data.notificationId });
    openNotification(content.data);
  }, [response, markRead]);
};
