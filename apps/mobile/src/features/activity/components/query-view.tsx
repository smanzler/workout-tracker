import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import type { UseQueryResult } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react-native";
import { View } from "react-native";

type StatusViewProps = {
  errorTitle: string;
  errorDescription: string;
  renderData: () => React.ReactNode;
};

const statusViews: Record<
  UseQueryResult["status"],
  (props: StatusViewProps) => React.ReactNode
> = {
  pending: () => (
    <View className="flex-1 items-center justify-center py-8">
      <Spinner />
    </View>
  ),
  error: ({ errorTitle, errorDescription }) => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon as={TriangleAlert} />
        </EmptyMedia>
        <EmptyTitle>{errorTitle}</EmptyTitle>
        <EmptyDescription>{errorDescription}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
  success: ({ renderData }) => renderData(),
};

/**
 * Shows a spinner while the query loads, a message when it fails, and else
 * `children` with the data.
 */
export function QueryView<TData, TError>({
  query,
  errorTitle,
  errorDescription = "Check your connection and try again.",
  children,
}: {
  query: UseQueryResult<TData, TError>;
  errorTitle: string;
  errorDescription?: string;
  children: (data: TData) => React.ReactNode;
}) {
  return statusViews[query.status]({
    errorTitle,
    errorDescription,
    renderData: () => query.isSuccess && children(query.data),
  });
}
