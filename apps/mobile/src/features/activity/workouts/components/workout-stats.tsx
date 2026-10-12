import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { Outputs } from "@rep/api";
import { View } from "react-native";
import { formatTimer, getWorkoutLength } from "@/lib/duration";
import { formatWeight } from "@/lib/format";
import { countPersonalRecords } from "@/lib/personal-records";
import { sumVolume } from "@/lib/volume";

type Workout = Outputs["activity"]["workout"]["get"];

function Stat({
  label,
  value,
  highlighted = false,
  className,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
  className?: string;
}) {
  return (
    <View
      className={cn(
        "w-1/2 gap-0.5 border-border px-5 py-3",
        highlighted && "bg-brand",
        className,
      )}
    >
      <Text
        className={cn(
          "font-mono text-[11px] tracking-wide text-muted-foreground",
          highlighted && "text-brand-foreground",
        )}
      >
        {label}
      </Text>
      <Text
        className={cn(
          "font-mono text-[26px] font-medium",
          highlighted && "text-brand-foreground",
        )}
      >
        {value}
      </Text>
    </View>
  );
}

/** The duration, volume, set count and record count of a workout. */
export function WorkoutStats({ workout }: { workout: Workout }) {
  const sets = workout.exercises.flatMap(({ sets }) => sets);
  const seconds = getWorkoutLength(workout) / 1000;

  return (
    <View className="flex-row flex-wrap border-b border-border">
      <Stat
        label="DURATION"
        value={formatTimer(seconds)}
        className="border-b border-r"
      />
      <Stat
        label="VOLUME"
        value={formatWeight(sumVolume(sets))}
        className="border-b"
      />
      <Stat label="SETS" value={sets.length.toString()} className="border-r" />
      <Stat
        label="NEW RECORDS"
        value={countPersonalRecords(sets).toString()}
        highlighted
      />
    </View>
  );
}
