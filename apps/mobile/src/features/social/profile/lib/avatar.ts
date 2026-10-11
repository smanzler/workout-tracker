import { uploadImage } from "@/lib/image";
import type { AppRouter } from "@rep/api";
import type { TRPCClient } from "@trpc/client";

/** Uploads the image at `avatar` to S3 and makes it the user's avatar. */
export const uploadAvatar = async (
  client: TRPCClient<AppRouter>,
  avatar: string,
) => {
  const { uploadUrl, uploadKey } =
    await client.social.profile.avatar.upload.mutate();

  await uploadImage(uploadUrl, avatar);

  return client.social.profile.avatar.complete.mutate({ uploadKey });
};
