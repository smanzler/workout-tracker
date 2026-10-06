import { defineConfig } from "vitest/config";
import type { Env } from "./src/env";

const testEnv: Record<keyof Env, string> = {
  BETTER_AUTH_SECRET: "test-secret",
  BETTER_AUTH_URL: "https://auth.test",

  DATABASE_URL: "postgres://test:test@localhost:5433/test",
  PORT: "4100",

  BUCKET_REGION: "us-east-1",
  BUCKET_ACCESS_KEY_ID: "test-access-key-id",
  BUCKET_SECRET_KEY: "test-secret-key",
  BUCKET_NAME: "test-bucket",
  BUCKET_URL: "https://cdn.example.com",

  SMTP_HOST: "test",
  SMTP_PORT: "1026",
  SMTP_SECURE: "false",
  SMTP_USER: "test-user",
  SMTP_PASSWORD: "test-pass",
  SMTP_FROM: "test@example.com",

  EXPO_ACCESS_TOKEN: "test-expo-token",

  GOOGLE_CLIENT_ID: "test-google-client-id",
  GOOGLE_CLIENT_SECRET: "test-google-client-secret",

  APPLE_CLIENT_ID: "com.example.test",
  APPLE_TEAM_ID: "TESTTEAMID",
  APPLE_KEY_ID: "TESTKEYID",
  APPLE_PRIVATE_KEY: "test-private-key",
  APPLE_APP_BUNDLE_IDENTIFIER: "com.example.test",

  REVIEW_EMAIL: "review@example.com",
  REVIEW_OTP: "123456",
};

export default defineConfig({
  test: {
    env: testEnv,
  },
});
