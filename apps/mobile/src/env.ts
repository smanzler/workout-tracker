import { z } from "zod";

export const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;

// Expo inlines EXPO_PUBLIC_ variables only when the code names each one.
export const env = envSchema.parse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});
