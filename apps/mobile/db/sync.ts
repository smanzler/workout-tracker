import { synchronize, type SyncTableChangeSet } from "@nozbe/watermelondb/sync";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import database from ".";

export async function mySync(
  user: User | undefined,
  updateLastSync: (timestamp: number) => Promise<void>,
  setSyncing: React.Dispatch<React.SetStateAction<boolean>>,
  pullAllChanges: boolean = false,
) {
  if (!user) {
    console.log("no user");
    return;
  }

  setSyncing(true);

  await synchronize({
    database,
    sendCreatedAsUpdated: true,
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      console.log(lastPulledAt);
      const timestamp = pullAllChanges ? 0 : lastPulledAt || 0;

      try {
        const { data, error } = await supabase.rpc("pull", {
          last_pulled_at: timestamp,
          schemaversion: schemaVersion,
          migration,
        });

        if (error) {
          console.log("Pull error:", error);

          return {
            changes: {},
            timestamp: timestamp,
          };
        }

        console.log("pull", JSON.stringify(data));

        await updateLastSync(data.timestamp);

        return {
          changes: data.changes,
          timestamp: data.timestamp,
        };
      } catch (err) {
        console.error("Unexpected pull error:", err);

        return {
          changes: {},
          timestamp: timestamp,
        };
      }
    },
    pushChanges: async ({
      changes,
    }: {
      changes: Record<string, SyncTableChangeSet | undefined>;
    }) => {
      const filteredChanges = {
        ...changes,
        exercises: {
          created:
            changes.exercises?.created?.filter(
              (exercise) => !exercise.is_default,
            ) || [],
        },
      };

      console.log("pushing changes:", JSON.stringify(filteredChanges));

      try {
        const { error } = await supabase.rpc("push", {
          changes: filteredChanges,
        });
        if (error) {
          console.log("Push error:", error);
          throw new Error(`Push failed: ${error.message}`);
        }

        console.log("Push successful");
      } catch (err) {
        console.error("Unexpected push error:", err);
        throw err;
      }
    },
  });

  setSyncing(false);
}
