import db from "../../db/index";
import { users } from "../../db/schema";
import { s3 } from "../../lib/s3";
import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { env } from "../../env";
import { protectedProcedure, router } from "../../lib/trpc";

const deleteUploads = async (userId: string) => {
  const { Contents = [] } = await s3.send(
    new ListObjectsV2Command({
      Bucket: env.BUCKET_NAME,
      Prefix: `uploads/${userId}/`,
    }),
  );

  if (Contents.length === 0) return;

  await s3.send(
    new DeleteObjectsCommand({
      Bucket: env.BUCKET_NAME,
      Delete: { Objects: Contents.map(({ Key }) => ({ Key })) },
    }),
  );
};

export const accountRouter = router({
  delete: protectedProcedure.mutation(async (opts) => {
    const { user } = opts.ctx;

    // Remove uploads first. If this fails, the account stays and the user can try again.
    await deleteUploads(user.id);
    await db.delete(users).where(eq(users.id, user.id));

    return { userId: user.id };
  }),
});
