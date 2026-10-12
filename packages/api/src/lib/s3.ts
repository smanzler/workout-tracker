import { env } from "../env";
import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: env.BUCKET_REGION,
  // A presigned URL has no body, so the SDK signs the checksum of an empty
  // body and the bucket then rejects the real bytes.
  requestChecksumCalculation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: env.BUCKET_ACCESS_KEY_ID,
    secretAccessKey: env.BUCKET_SECRET_KEY,
  },
  // Other S3-compatible services, the local mock included, use their own
  // endpoint and take the bucket from the path, not the host.
  ...(env.BUCKET_ENDPOINT && {
    endpoint: env.BUCKET_ENDPOINT,
    forcePathStyle: true,
  }),
});
