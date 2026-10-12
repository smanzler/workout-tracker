import { Text } from "@/components/ui/text";
import { View } from "react-native";

/** The "rep." wordmark over the tagline. */
export function Wordmark() {
  return (
    <View className="gap-2.5">
      <Text
        role="heading"
        accessibilityLabel="Rep"
        className="text-[64px] font-bold leading-[68px] tracking-tighter"
      >
        rep<Text className="text-[64px] font-bold text-brand">.</Text>
      </Text>
      <Text className="font-mono text-[13px] tracking-widest text-muted-foreground">
        LOG EVERY SET. SEE EVERY RECORD.
      </Text>
    </View>
  );
}
