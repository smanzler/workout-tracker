import { useTRPC, useTRPCClient } from "@/lib/trpc";
import { type ImportWorkoutsInput, maxImportWorkouts } from "@rep/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDocumentAsync } from "expo-document-picker";
import { File } from "expo-file-system";
import { Alert } from "react-native";
import { parseStrongCsv } from "../lib/strong-csv";

const toChunks = <TItem>(items: TItem[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );

const countWorkouts = (count: number) =>
  count === 1 ? "1 workout" : `${count} workouts`;

/**
 * Returns `importFile`, which lets the user pick a CSV export from Strong,
 * imports its workouts and shows how many it added.
 */
export const useStrongImport = () => {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (workouts: ImportWorkoutsInput["workouts"]) => {
      let importedCount = 0;
      let skippedCount = 0;
      for (const chunk of toChunks(workouts, maxImportWorkouts)) {
        const result = await trpcClient.activity.workout.import.mutate({
          workouts: chunk,
        });
        importedCount += result.importedCount;
        skippedCount += result.skippedCount;
      }

      return { importedCount, skippedCount };
    },
    // A failed chunk keeps the chunks before it.
    onSettled: () => {
      queryClient.invalidateQueries(trpc.activity.workout.pathFilter());
      queryClient.invalidateQueries(trpc.activity.exercise.pathFilter());
    },
  });

  const importFile = async () => {
    const result = await getDocumentAsync({
      type: ["text/csv", "text/comma-separated-values"],
      copyToCacheDirectory: true,
    });
    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;

    const workouts = parseStrongCsv(await new File(asset.uri).text());
    if (workouts.length === 0) {
      Alert.alert("Could not import", "This file has no Strong workouts.");
      return;
    }

    mutate(workouts, {
      onSuccess: ({ importedCount, skippedCount }) =>
        Alert.alert(
          "Import finished",
          [
            `Added ${countWorkouts(importedCount)}.`,
            skippedCount > 0 &&
              `Skipped ${countWorkouts(skippedCount)} that you imported before.`,
          ]
            .filter(Boolean)
            .join(" "),
        ),
      onError: () =>
        Alert.alert(
          "Could not import",
          "Try again. Workouts that you imported before are skipped.",
        ),
    });
  };

  return { importFile, isPending };
};
