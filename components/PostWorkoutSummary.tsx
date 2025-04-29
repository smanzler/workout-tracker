import { View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import dayjs from "dayjs";

export interface PostSet {
  reps?: number;
  weight?: number;
  is_1rm_pr?: boolean;
  is_volume_pr?: boolean;
  is_weight_pr?: boolean;
}

export interface PostExercise {
  exercise_title: string;
  sets: PostSet[];
}

export interface PostWorkout {
  workout_id: string;
  workout_name: string;
  start_time: string;
  end_time: string;
  exercises: PostExercise[];
}

export interface PostRoutine {
  routine_id: string;
  routine_name: string;
  exercises: PostExercise[];
}

interface WorkoutDisplayData {
  name: string;
  id: string;
  start_time: Date;
  end_time?: Date | null;
  exercises: PostExercise[];
}

const transformToDisplayData = (
  data: PostRoutine | PostWorkout
): WorkoutDisplayData => {
  if ("routine_name" in data) {
    return {
      name: data.routine_name,
      id: data.routine_id,
      start_time: new Date(),
      exercises: data.exercises,
    };
  } else {
    return {
      name: data.workout_name,
      id: data.workout_id,
      start_time: new Date(data.start_time),
      end_time: data.end_time ? new Date(data.end_time) : undefined,
      exercises: data.exercises,
    };
  }
};

const PostWorkoutSummary = ({
  workout,
}: {
  workout: PostRoutine | PostWorkout;
}) => {
  const { colors } = useTheme();

  const workoutData = transformToDisplayData(workout);

  const prCounts = workoutData.exercises.reduce(
    (acc, exercise) => {
      exercise.sets.forEach((set) => {
        if (set.is_1rm_pr) acc.oneRM++;
        if (set.is_volume_pr) acc.volume++;
        if (set.is_weight_pr) acc.weight++;
      });
      return acc;
    },
    { oneRM: 0, volume: 0, weight: 0 }
  );

  const totalPRs = prCounts.oneRM + prCounts.volume + prCounts.weight;

  const getBestSet = (sets: PostSet[]) => {
    if (sets.length === 0) return null;

    return [...sets].sort((a, b) => {
      if (a.weight === b.weight) {
        return (b.reps || 0) - (a.reps || 0);
      }
      return (b.weight || 0) - (a.weight || 0);
    })[0];
  };

  const getDuration = () => {
    if (!workoutData.end_time) return null;
    const start = dayjs(workoutData.start_time);
    const end = dayjs(workoutData.end_time);
    const minutes = end.diff(start, "minute");
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.card }}>
      <View style={{ padding: 16, height: "100%" }}>
        <View style={{ gap: 20 }}>
          <View style={{ gap: 4 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <ThemedText type="subtitle" numberOfLines={1}>
                  {workoutData.name}
                </ThemedText>
              </View>
              {totalPRs > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <FontAwesome5 name="trophy" size={12} color="#FFD700" />
                  <ThemedText type="default">
                    {totalPRs} PR{totalPRs > 1 ? "s" : ""}
                  </ThemedText>
                </View>
              )}
            </View>

            {workoutData.end_time && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <FontAwesome5
                    name="calendar"
                    size={12}
                    color={colors.text}
                    style={{ opacity: 0.7 }}
                  />
                  <ThemedText type="default" style={{ opacity: 0.7 }}>
                    {dayjs(workoutData.start_time).format(
                      "MMMM D, YYYY [at] h:mm A"
                    )}
                  </ThemedText>
                </View>
                {getDuration() && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FontAwesome5
                      name="clock"
                      size={12}
                      color={colors.text}
                      style={{ opacity: 0.7 }}
                    />
                    <ThemedText type="default" style={{ opacity: 0.7 }}>
                      {getDuration()}
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={{ gap: 8 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 4,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <ThemedText type="defaultSemiBold" style={{ opacity: 0.7 }}>
                Exercise
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={{ opacity: 0.7 }}>
                Best Set
              </ThemedText>
            </View>

            <View style={{ gap: 12 }}>
              {workoutData.exercises.map((exercise, i) => {
                const bestSet = getBestSet(exercise.sets);
                const hasPR =
                  bestSet &&
                  (bestSet.is_1rm_pr ||
                    bestSet.is_volume_pr ||
                    bestSet.is_weight_pr);

                return (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <ThemedText type="defaultSemiBold" numberOfLines={1}>
                        {exercise.sets.length} × {exercise.exercise_title}
                      </ThemedText>
                    </View>

                    {bestSet && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                          minWidth: 65,
                        }}
                      >
                        <ThemedText type="defaultSemiBold">
                          {bestSet.weight ? `${bestSet.weight}kg × ` : ""}
                          {bestSet.reps || "-"}
                        </ThemedText>
                        {hasPR && (
                          <FontAwesome5
                            name="trophy"
                            size={10}
                            color="#FFD700"
                            style={{ marginLeft: 2 }}
                          />
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostWorkoutSummary;
