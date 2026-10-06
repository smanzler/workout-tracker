import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "./use-toast";
import { NotificationType } from "../screens/notifications";

function showToast(notification: NotificationType) {
  useToast.getState().show(notification);
}

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useLiveNotifications(userId?: string) {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useNotifications(userId);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificationType;

          queryClient.setQueryData(
            ["notifications", userId],
            (old: any[] = []) => [newNotification, ...old],
          );

          showToast(newNotification);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    const now = new Date().toISOString();

    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("id", notificationId);

    queryClient.setQueryData(["notifications", userId], (old: any[] = []) =>
      old.map((n) => (n.id === notificationId ? { ...n, read_at: now } : n)),
    );
  };

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
  };
}

function getNotificationMessage(notification: any): string {
  switch (notification.type) {
    case "like":
      return "Someone liked your post!";
    case "follow":
      return "You have a new follower!";
    case "follow_request":
      return "Someone requested to follow you!";
    default:
      return "You have a new notification.";
  }
}
