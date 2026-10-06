import { useState } from "react";
import { RefreshControl, type RefreshControlProps } from "react-native";

/** A pull-to-refresh control that shows its spinner until `refetch` ends. */
export function RefetchControl({
  refetch,
  ...props
}: {
  refetch: () => Promise<unknown>;
} & Omit<RefreshControlProps, "refreshing">) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <RefreshControl
      {...props}
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      title="Refresh"
    />
  );
}
