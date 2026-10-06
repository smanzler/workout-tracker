import { defineConfig } from "vitest/config";
import type { Env } from "./src/env";

const testEnv: Record<keyof Env, string> = {
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "https://auth.test",

  DATABASE_URL: "postgres://test:test@localhost:5433/test",
  PORT: "4100",

  SMTP_HOST: "test",
  SMTP_PORT: "1026",
  SMTP_SECURE: "false",
  SMTP_USER: "test-user",
  SMTP_PASSWORD: "test-pass",
  SMTP_FROM: "test@example.com",

  REVIEW_EMAIL: "review@example.com",
  REVIEW_OTP: "123456",
};

export default defineConfig({
  test: {
    env: testEnv,
  },
});
