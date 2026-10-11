import { env } from "../../../env";

export function withAvatarUrl<T extends { avatarKey: string | null }>(
  profile: T,
) {
  const { avatarKey, ...rest } = profile;

  return {
    ...rest,
    avatarUrl: avatarKey ? `${env.BUCKET_URL}/${avatarKey}` : null,
  };
}
