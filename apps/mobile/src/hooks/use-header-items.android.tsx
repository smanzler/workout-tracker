import { Stack } from "expo-router";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import type { HeaderItem, HeaderItemLook } from "./use-header-items";

const labelClassNames: Record<HeaderItemLook, string> = {
  plain: "font-normal",
  prominent: "text-primary font-bold",
};

const renderHeaderItem = (
  look: HeaderItemLook,
  { label, ...props }: HeaderItem,
) => (
  <Stack.Toolbar.View>
    <Button variant="ghost" size="sm" {...props}>
      <Text className={labelClassNames[look]}>{label}</Text>
    </Button>
  </Stack.Toolbar.View>
);

// Android toolbar buttons show only an icon, so a view holds the text button.
export const useHeaderItems = (): Record<
  HeaderItemLook,
  (item: HeaderItem) => React.ReactElement
> => ({
  plain: (item) => renderHeaderItem("plain", item),
  prominent: (item) => renderHeaderItem("prominent", item),
});
