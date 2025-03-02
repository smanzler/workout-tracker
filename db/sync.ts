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
      const { data, error } = await supabase.rpc("pull", {
        last_pulled_at: lastPulledAt,
        schemaversion: schemaVersion,
        migration,
      });

      console.log("pull", JSON.stringify(data));
      if (error) console.log(error);

      await updateLastSync(data.timestamp);

      return { changes: data.changes, timestamp: data.timestamp };
    },
    pushChanges: async ({ changes }) => {
      console.log("pushing changes:", JSON.stringify(changes));

      const { error } = await supabase.rpc("push", { changes });

      if (error) console.log(error);
    },
  });

  setSyncing(false);
}
