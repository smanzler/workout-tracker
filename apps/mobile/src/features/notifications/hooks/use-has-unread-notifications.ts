import { useNotifications } from "./use-notifications";

export const useHasUnreadNotifications = () => {
  const { data: notifications } = useNotifications();
  return notifications?.some(({ readAt }) => !readAt) ?? false;
};
