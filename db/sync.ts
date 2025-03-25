import { synchronize } from "@nozbe/watermelondb/sync";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import database from ".";

export async function mySync(
  user: User | undefined,
  updateLastSync: (timestamp: number) => Promise<void>,
  setSyncing: React.Dispatch<React.SetStateAction<boolean>>
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

      try {
        const { data, error } = await supabase.rpc("pull", {
          last_pulled_at: lastPulledAt,
          schemaversion: schemaVersion,
          migration,
        });

        if (error) {
          console.log("Pull error:", error);

          return {
            changes: {},
            timestamp: lastPulledAt || 0,
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
          timestamp: lastPulledAt || 0,
        };
      }
    },
    pushChanges: async ({ changes }) => {
      console.log("pushing changes:", JSON.stringify(changes));

      try {
        const { error } = await supabase.rpc("push", { changes });

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
