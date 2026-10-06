import { z } from "zod";
import "dotenv/config";

export const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),

  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(4100),

  BUCKET_REGION: z.string(),
  BUCKET_ACCESS_KEY_ID: z.string(),
  BUCKET_SECRET_KEY: z.string(),
  BUCKET_NAME: z.string(),
  BUCKET_URL: z.string(),

  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().default(1026),
  SMTP_SECURE: z.stringbool().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default("Rep <noreply@rep.local>"),

  REVIEW_EMAIL: z.email().toLowerCase().optional(),
  REVIEW_OTP: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

// A blank line in .env (`REVIEW_EMAIL=`) means unset.
export const env = envSchema.parse(
  Object.fromEntries(
    Object.entries(process.env).filter(([, value]) => value !== ""),
  ),
);
