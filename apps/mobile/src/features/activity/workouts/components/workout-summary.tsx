import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import { Calendar, Clock, Trophy, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { findBestSet, formatSet } from "../../lib/format";
import { formatDate, formatTime } from "../lib/date";
import { formatDuration } from "../lib/duration";
import {
  countPersonalRecords,
  isPersonalRecord,
} from "../lib/personal-records";

type Workout = Outputs["activity"]["workout"]["get"];

function Detail({ icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon as={icon} className="size-3.5 text-muted-foreground" />
      <Text variant="muted">{children}</Text>
    </View>
  );
}

/** The name, time, records and best set of each exercise of a workout. */
export function WorkoutSummary({ workout }: { workout: Workout }) {
  const records = countPersonalRecords(
    workout.exercises.flatMap(({ sets }) => sets),
  );

  return (
    <Card>
      <CardHeader className="gap-2">
        <View className="flex-row items-center gap-2">
          <CardTitle className="flex-1 text-xl" numberOfLines={1}>
            {workout.name}
          </CardTitle>
          {records > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Icon as={Trophy} className="size-3 text-yellow-500" />
              <Text>
                {records} {records === 1 ? "PR" : "PRs"}
              </Text>
            </Badge>
          )}
        </View>
        <View className="flex-row flex-wrap gap-x-4 gap-y-1">
          <Detail icon={Calendar}>
            {`${formatDate(workout.startedAt)} at ${formatTime(workout.startedAt)}`}
          </Detail>
          <Detail icon={Clock}>
            {formatDuration(
              workout.endedAt.getTime() - workout.startedAt.getTime(),
            )}
          </Detail>
        </View>
      </CardHeader>

      <CardContent className="gap-2">
        <View className="flex-row justify-between border-b border-border pb-1">
          <Text variant="small" className="text-muted-foreground">
            Exercise
          </Text>
          <Text variant="small" className="text-muted-foreground">
            Best Set
          </Text>
        </View>
        {workout.exercises.map(({ id, exercise, sets }) => {
          const bestSet = findBestSet(sets);

          return (
            <View key={id} className="flex-row items-center gap-2">
              <Text className="flex-1 font-medium" numberOfLines={1}>
                {sets.length} × {exercise.title}
              </Text>
              {bestSet && <Text>{formatSet(bestSet)}</Text>}
              {sets.some(isPersonalRecord) && (
                <Icon
                  as={Trophy}
                  className="size-3.5 text-yellow-500"
                  accessibilityLabel="Personal record"
                />
              )}
            </View>
          );
        })}
      </CardContent>
    </Card>
  );
}
