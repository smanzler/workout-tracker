import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Size = "sm" | "lg";

const sizes: Record<Size, { avatar: string; text: string }> = {
  sm: { avatar: "size-9", text: "text-[13px]" },
  lg: { avatar: "size-[60px]", text: "text-xl" },
};

/** The photo of a profile, or the first two letters of its username. */
export function ProfileAvatar({
  profile,
  size,
  alt = "",
  className,
  children,
}: {
  profile: { username: string; avatarUrl: string | null } | null | undefined;
  size: Size;
  alt?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Avatar alt={alt} className={cn(sizes[size].avatar, className)}>
      <AvatarImage source={{ uri: profile?.avatarUrl ?? undefined }} />
      <AvatarFallback className="bg-brand/10">
        <Text
          className={cn(
            "font-mono font-semibold uppercase text-brand",
            sizes[size].text,
          )}
        >
          {profile?.username.slice(0, 2)}
        </Text>
      </AvatarFallback>
      {children}
    </Avatar>
  );
}
