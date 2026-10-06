import { forwardRef } from "react";
import { ScrollViewProps } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export const BodyScrollView = forwardRef<any, ScrollViewProps>((props, ref) => {
  return (
    <ScrollView
      automaticallyAdjustsScrollIndicatorInsets
      contentInsetAdjustmentBehavior="automatic"
      contentInset={{ bottom: 0 }}
      scrollIndicatorInsets={{ bottom: 0 }}
      {...props}
      ref={ref}
    />
  );
});
