import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import type { PersonalRecordFlags } from "@rep/shared";
import { Trophy } from "lucide-react-native";
import { View } from "react-native";
import { formatSet } from "../../lib/format";

type WorkoutExercise =
  Outputs["activity"]["workout"]["get"]["exercises"][number];

const recordLabels: Record<keyof PersonalRecordFlags, string> = {
  isWeightPr: "Weight",
  isVolumePr: "Volume",
  isOneRepMaxPr: "1RM",
};

const recordFlags = Object.keys(recordLabels) as (keyof PersonalRecordFlags)[];

/** The sets of one exercise in a saved workout, with the records they broke. */
export function WorkoutExerciseCard({
  workoutExercise: { exercise, notes, sets },
}: {
  workoutExercise: WorkoutExercise;
}) {
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="gap-1 px-4">
        <CardTitle className="text-lg">{exercise.title}</CardTitle>
        {notes && <Text variant="muted">{notes}</Text>}
      </CardHeader>
      <CardContent className="gap-2 px-4">
        {sets.map((set, index) => (
          <View key={set.id} className="flex-row items-center gap-3">
            <View className="size-6 items-center justify-center rounded-full bg-muted">
              <Text className="text-xs font-semibold">{index + 1}</Text>
            </View>
            <Text>{formatSet(set)}</Text>
            <View className="flex-1 flex-row flex-wrap justify-end gap-1">
              {recordFlags
                .filter((flag) => set[flag])
                .map((flag) => (
                  <Badge key={flag} variant="outline" className="gap-1">
                    <Icon as={Trophy} className="size-3 text-yellow-500" />
                    <Text>{recordLabels[flag]}</Text>
                  </Badge>
                ))}
            </View>
          </View>
        ))}
      </CardContent>
    </Card>
  );
}
