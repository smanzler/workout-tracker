import { BodyScrollView } from "@/components/ui/body-scroll-view";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
import { CircleCheck } from "lucide-react-native";
import { View } from "react-native";
import { EULA, EULA_SUMMARY_POINTS } from "../lib/eula";

export default function Terms() {
  return (
    <BodyScrollView>
      <Stack.Screen options={{ headerTitle: "Terms of Use" }} />

      <View className="gap-3">
        {EULA_SUMMARY_POINTS.map((point) => (
          <View key={point} className="flex-row items-center gap-3">
            <Icon as={CircleCheck} className="text-primary" />
            <Text className="flex-1">{point}</Text>
          </View>
        ))}
      </View>

      <Card>
        <CardContent>
          <Text variant="muted">{EULA}</Text>
        </CardContent>
      </Card>
    </BodyScrollView>
  );
}
