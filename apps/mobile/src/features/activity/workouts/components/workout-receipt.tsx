import { Text } from "@/components/ui/text";
import type { Outputs } from "@rep/api";
import type { ReactNode } from "react";
import { View } from "react-native";
import { formatDate, formatTime } from "@/lib/date";
import { WorkoutExercise } from "./workout-exercise";
import { WorkoutStats } from "./workout-stats";

/** The name, times, stats and sets of a workout. `children` show above the name. */
export function WorkoutReceipt({
  workout,
  children,
}: {
  workout: Outputs["activity"]["workout"]["get"];
  children?: ReactNode;
}) {
  return (
    <>
      <View className="gap-1 border-b border-border px-5 pb-4 pt-1">
        {children}
        <Text className="text-[30px] font-semibold tracking-tight">
          {workout.name}
        </Text>
        <Text className="font-mono text-[13px] uppercase text-muted-foreground">
          {formatDate(workout.startedAt)} · {formatTime(workout.startedAt)}–
          {formatTime(workout.endedAt)}
        </Text>
      </View>

      <WorkoutStats workout={workout} />

      {workout.exercises.map((exercise) => (
        <WorkoutExercise key={exercise.id} exercise={exercise} />
      ))}
    </>
  );
}
