import { env } from "../env";
import { S3Client } from "@aws-sdk/client-s3";

const region = env.BUCKET_REGION;
const accessKeyId = env.BUCKET_ACCESS_KEY_ID;
const secretAccessKey = env.BUCKET_SECRET_KEY;

export const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
